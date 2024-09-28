import express, {Request, Response, NextFunction} from "express";
import mysql from "mysql2/promise";
import session from "express-session";

declare module 'express-serve-static-core' {
    interface Request {
        session: session & {};
    }
}

const app = express();

// Configura EJS como a engine de renderização de templates
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

// Middleware para permitir dados no formato JSON
app.use(express.json());
// Middleware para permitir dados no formato URLENCODED
app.use(express.urlencoded({ extended: true }));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use(session({
    secret: 'segredo',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

function verificaLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/categories', verificaLogin, async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM categories");
    return res.render('categories/index', {
        categories: rows
    });
});

app.get("/categories/form", verificaLogin, async function (req: Request, res: Response) {
    return res.render("categories/form");
});

app.post("/categories/save", verificaLogin, async function(req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", verificaLogin, async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/users", verificaLogin, async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");

    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;

    req.session.successMessage = null;
    req.session.errorMessage = null;

    return res.render("users/index", {
        users: rows,
        successMessage,
        errorMessage
    });
});


app.get("/users/add", async function (req: Request, res: Response) {
    return res.render("users/add");
});

app.post("/users/save", async function(req: Request, res: Response) {    
    const body = req.body;
    const isActive = body.ativo === "on" ? 1 : 0;
    
    if(body.senha != body.confirmsenha){
         return res.render("users/add", { errorMessage: "As senhas devem ser iguais!" });
    }else{
        const insertQuery = "INSERT INTO users (name,email,senha,papel, ativo,created_at) VALUES (?,?,?,?,?,now())";
        await connection.query(insertQuery, [body.name, body.email, body.senha, body.papel, isActive]);

        res.redirect("/users");
    }
});

app.post("/users/edit/:id", async function(req: Request, res: Response) {    
    const id = req.params.id;
    const sqlSearch = "SELECT * FROM users WHERE id = ?"
    const sqlSearchFinals = await connection.query(sqlSearch, [id]);
    const [rows] = sqlSearchFinals;
    return res.render("users/edit", {
        users: rows
    });   
    
});

app.post("/users/update", verificaLogin, async function(req: Request, res: Response) {    
    const body = req.body;
    const isActive = body.ativo === "on" ? 1 : 0;

    const sqlSearchForUpdate = "SELECT * FROM users WHERE email = ? AND senha = ?";
    const [rows] = await connection.query(sqlSearchForUpdate, [body.email, body.senha]);
    
    if (rows.length > 0) {
        if(body.confirmsenha){
            const updateQuery = "UPDATE users SET name = ?, email = ?, senha = ?, papel = ?, ativo = ?, updated_at = now() WHERE id = ?;";
            await connection.query(updateQuery, [body.name, body.email, body.confirmsenha, body.papel, isActive, body.id]);
        }else{
            const updateQuery = "UPDATE users SET name = ?, email = ?, papel = ?, ativo = ?, updated_at = now() WHERE id = ?;";
            await connection.query(updateQuery, [body.name, body.email, body.papel, isActive, body.id]);
        }
        
        req.session.successMessage = "Credenciais alteradas com sucesso!";
        res.redirect("/users");
    } else {
        req.session.errorMessage = "NADA ALTERADO. Favor inserir as credenciais básicas corretamente, Email ou Senha Incorretos.";
        res.redirect("/users");
    }
});


app.post("/users/delete/:id", verificaLogin, async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/users");
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/login", async function (req: Request, res: Response) {
    return res.render("login/index");
});

app.post("/login/search", async function(req: Request, res: Response) {
    const body = req.body;
    const searchQuery = "SELECT * FROM users WHERE email = ? AND senha = ?";
    const [rows] = await connection.query(searchQuery, [body.email, body.senha]);
    
    if (rows.length > 0) {
        req.session.userId = (rows as any)[0].id;
        res.redirect("/users");
    } else {
        return res.render("login/index", { errorMessage: "Email ou senha incorretos!" });
    }
});

app.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/users');
        }
        res.redirect('/login');
    });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', verificaLogin, async function (req: Request, res: Response) {
    return res.render('home/index');
});

app.listen('3000', () => console.log("Server is listening on port 3000"));
