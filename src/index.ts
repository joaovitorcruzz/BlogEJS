import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import session from "express-session";
import bcrypt from 'bcrypt';

// Declaração para adicionar a interface de sessão ao Request
declare module 'express-serve-static-core' {
    interface Request {
        session: session & {};
    }
}

// Classe de conexão ao banco de dados
class Database {
    private pool;

    constructor() {
        this.pool = mysql.createPool({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "mudar123",
            database: "unicesumar"
        });
    }

    public query = (sql: string, params: any[]) => {
        return this.pool.query(sql, params);
    }
}

// Classe principal do aplicativo
class App {
    public expressApp: express.Application;
    private db: Database;

    constructor() {
        this.expressApp = express();
        this.db = new Database();
        this.config();
        this.routes();
    }

    private config() {
        // Configura EJS como a engine de renderização de templates
        this.expressApp.set('view engine', 'ejs');
        this.expressApp.set('views', `${__dirname}/views`);

        // Middleware para permitir dados no formato JSON
        this.expressApp.use(express.json());
        // Middleware para permitir dados no formato URLENCODED
        this.expressApp.use(express.urlencoded({ extended: true }));

        // Configuração da sessão
        this.expressApp.use(session({
            secret: 'segredo',
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false }
        }));
    }

    private verificaLogin(req: Request, res: Response, next: NextFunction) {
        if (req.session && req.session.userId) {
            next();
        } else {
            res.redirect('/login');
        }
    }

    private routes() {
        this.expressApp.get('/categories', this.verificaLogin.bind(this), this.getCategories.bind(this));
        this.expressApp.get("/categories/form", this.verificaLogin.bind(this), this.getCategoryForm.bind(this));
        this.expressApp.post("/categories/save", this.verificaLogin.bind(this), this.saveCategory.bind(this));
        this.expressApp.post("/categories/delete/:id", this.verificaLogin.bind(this), this.deleteCategory.bind(this));

        this.expressApp.get("/users", this.verificaLogin.bind(this), this.getUsers.bind(this));
        this.expressApp.get("/users/add", this.getAddUserForm.bind(this));
        this.expressApp.post("/users/save", this.saveUser.bind(this));
        this.expressApp.post("/users/edit/:id", this.getEditUser.bind(this));
        this.expressApp.post("/users/update", this.verificaLogin.bind(this), this.updateUser.bind(this));
        this.expressApp.post("/users/delete/:id", this.verificaLogin.bind(this), this.deleteUser.bind(this));

        this.expressApp.get("/login", this.getLogin.bind(this));
        this.expressApp.post("/login/search", this.loginUser.bind(this));
        this.expressApp.get('/logout', this.logoutUser.bind(this));

        this.expressApp.get('/', this.verificaLogin.bind(this), this.getHome.bind(this));
    }

    private async getCategories(req: Request, res: Response) {
        const [rows] = await this.db.query("SELECT * FROM categories", []);
        return res.render('categories/index', {
            categories: rows
        });
    }

    private getCategoryForm(req: Request, res: Response) {
        return res.render("categories/form");
    }

    private async saveCategory(req: Request, res: Response) {
        const body = req.body;
        const insertQuery = "INSERT INTO categories (name) VALUES (?)";
        await this.db.query(insertQuery, [body.name]);
        res.redirect("/categories");
    }

    private async deleteCategory(req: Request, res: Response) {
        const id = req.params.id;
        const sqlDelete = "DELETE FROM categories WHERE id = ?";
        await this.db.query(sqlDelete, [id]);
        res.redirect("/categories");
    }

    private async getUsers(req: Request, res: Response) {
        const [rows] = await this.db.query("SELECT * FROM users", []);
        const successMessage = req.session.successMessage;
        const errorMessage = req.session.errorMessage;
        req.session.successMessage = null;
        req.session.errorMessage = null;

        return res.render("users/index", {
            users: rows,
            successMessage,
            errorMessage
        });
    }

    private getAddUserForm(req: Request, res: Response) {
        return res.render("users/add");
    }

    private async saveUser(req: Request, res: Response) {
        const body = req.body;
        const isActive = body.ativo === "on" ? 1 : 0;
    
        if (body.senha !== body.confirmsenha) {
            return res.render("users/add", { errorMessage: "As senhas devem ser iguais!" });
        } else {
            // Hash da senha
            const hashedPassword = await bcrypt.hash(body.senha, 10); // 10 é o número de salt rounds
            const insertQuery = "INSERT INTO users (name, email, senha, papel, ativo, created_at) VALUES (?, ?, ?, ?, ?, now())";
            await this.db.query(insertQuery, [body.name, body.email, hashedPassword, body.papel, isActive]);
            res.redirect("/users");
        }
    }
    
    private async getEditUser(req: Request, res: Response) {
        const id = req.params.id;
        const sqlSearch = "SELECT * FROM users WHERE id = ?";
        const [rows] = await this.db.query(sqlSearch, [id]);
    
        if (rows.length > 0) {
            return res.render("users/edit", {
                user: rows[0] // Alterar para enviar apenas o usuário único
            });
        } else {
            req.session.errorMessage = "Usuário não encontrado.";
            res.redirect("/users");
        }
    }
    
    

    private async updateUser(req: Request, res: Response) {
        const body = req.body;
        const isActive = body.ativo === "on" ? 1 : 0;
    
        // Buscar o usuário no banco de dados pelo email
        const sqlSearchForUpdate = "SELECT * FROM users WHERE email = ?";
        const [rows] = await this.db.query(sqlSearchForUpdate, [body.email]);
    
        if (rows.length > 0) {
            const user = (rows as any)[0];
    
            // Comparar a senha fornecida com a senha armazenada
            const isPasswordCorrect = await bcrypt.compare(body.senha, user.senha);
    
            if (isPasswordCorrect) {
                // Se uma nova senha for fornecida, fazer o hash
                if (body.confirmsenha) {
                    const hashedNewPassword = await bcrypt.hash(body.confirmsenha, 10);
                    const updateQuery = "UPDATE users SET name = ?, email = ?, senha = ?, papel = ?, ativo = ?, updated_at = now() WHERE id = ?";
                    await this.db.query(updateQuery, [body.name, body.email, hashedNewPassword, body.papel, isActive, body.id]);
                } else {
                    // Caso a senha não tenha sido alterada, manter a senha antiga
                    const updateQuery = "UPDATE users SET name = ?, email = ?, papel = ?, ativo = ?, updated_at = now() WHERE id = ?";
                    await this.db.query(updateQuery, [body.name, body.email, body.papel, isActive, body.id]);
                }
    
                req.session.successMessage = "Credenciais alteradas com sucesso!";
                res.redirect("/users");
            } else {
                req.session.errorMessage = "Senha incorreta. Por favor, insira a senha correta para confirmar.";
                res.redirect("/users");
            }
        } else {
            req.session.errorMessage = "Usuário não encontrado.";
            res.redirect("/users");
        }
    }
    

    private async deleteUser(req: Request, res: Response) {
        const id = req.params.id;
        const sqlDelete = "DELETE FROM users WHERE id = ?";
        await this.db.query(sqlDelete, [id]);
        res.redirect("/users");
    }

    private getLogin(req: Request, res: Response) {
        return res.render("login/index");
    }

    private async loginUser(req: Request, res: Response) {
        const body = req.body;
        const searchQuery = "SELECT * FROM users WHERE email = ?";
        const [rows] = await this.db.query(searchQuery, [body.email]);
    
        if (rows.length > 0) {
            const user = (rows as any)[0];
    
            // Comparando a senha com o hash armazenado
            const match = await bcrypt.compare(body.senha, user.senha);
            if (match) {
                req.session.userId = user.id;
                res.redirect("/users");
            } else {
                return res.render("login/index", { errorMessage: "Email ou senha incorretos!" });
            }
        } else {
            return res.render("login/index", { errorMessage: "Email ou senha incorretos!" });
        }
    }
    

    private logoutUser(req: Request, res: Response) {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/users');
            }
            res.redirect('/login');
        });
    }

    private getHome(req: Request, res: Response) {
        return res.render('home/index');
    }

    public start(port: number) {
        this.expressApp.listen(port, () => console.log(`Server is listening on port ${port}`));
    }
}

// Inicializando o aplicativo
const appInstance = new App();
appInstance.start(3000);
