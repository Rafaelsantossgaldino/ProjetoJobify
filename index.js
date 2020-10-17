const { response } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

/* Importando Banco de Dados Sqlite
    use a versao do sqlite3 yarn add sqlite@^3.0.0
*/
const sqlite = require("sqlite");
const dbConnection = sqlite.open("banco.sqlite", { Promise });


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true}));

// Requisicao e Resposta da pagina HOME
app.get("/", async (request, response) => {
  const db = await dbConnection;
  const categoriasDb = await db.all("select * from categorias;");
  const vagas = await db.all("select * from vagas;");
  const categorias = categoriasDb.map((cat) => {
    return {
      ...cat,
      vagas: vagas.filter((vaga) => vaga.categoria === cat.id),
    };
  });
  response.render("home", {
    categorias,
  });
});

// Requisicao e Resposta da pagina VAGA
app.get("/vaga/:id", async (request, response) => {
  const db = await dbConnection;
  const vagas = await db.get(
    "select * from vagas where id = " + request.params.id
  );
  response.render("vaga", {
    vagas,
  });
});

// Requisicao e Resposta da pagina ADMIN
app.get("/admin", (request, response) => {
  response.render("admin/home");
});

// Listando vagas
app.get("/admin/vagas", async (request, response) => {
  const db = await dbConnection;
  const vagas = await db.all("select * from vagas;");
  response.render("admin/vagas", { vagas });
});

// Deletando vagas
app.get("/admin/vagas/delete/:id", async (request, response) => {
  const db = await dbConnection;
  const id = request.params.id;
  await db.run("delete * from vagas where id = " + request.params.id + ";");
  resquest.redirect("/admin/vagas");
});

//Criando nova Vagas
app.get("/admin/vagas/nova", async (request, response) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias")
  response.render("admin/nova-vaga", {categorias});
});
// Requisicao do POST
app.post('/admin/vagas/nova', async(request, response) => {
  const { titulo, descricao, categoria} = request.body;
  const db = dbConnection
  await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria},'${titulo}', '${descricao}')`)
  response.redirect('/admin/vagas')
});

// Ediatr nova vagas
app.get("/admin/vagas/editar/:id", async(request, response) => {
  const db = await dbConnection;
  const categorias = await db.all("select * from categorias")
  const vaga = await db.get('selectec * from vagas whre id = '+request.params.id)
  response.render("admin/editar-vaga", {categorias, vaga});
});
app.post('/admin/vagas/editar/:id', async(request, response) => {
  const { titulo, descricao, categoria} = request.body;
  const {id} = request.params
  const db = dbConnection
  await db.run(`update vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' whre id = ${id})`)
  response.redirect('/admin/vagas')
});

// Criando tabelas
const init = async () => {
  const db = await dbConnection;
  await db.run(
    "create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT);"
  );
  await db.run(
    "create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);"
  );
  //const categoria = 'Marketing Team'
  //await db.run(`INSERT INTO categorias(categoria) values('${categoria}')`)
  const vaga = "Consultor SAP";
  const descricao = "Desenvolver ABAP ";
  //await db.run(`INSERT INTO vagas(categoria, titulo, descricao) values(3,'${vaga}', '${descricao}')`)
};
init();

// Resposta do Servidor
app.listen(3000, (err) => {
  if (err) {
    console.log("Nao foi Possivel iniciar o Servidor...");
  } else {
    console.log("Servidor Jobify Rodando...");
  }
});
