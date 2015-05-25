var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

//Cargar modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite
var sequelize = new Sequelize(DB_name, user, pwd,
					{dialect: protocol,
					protocol: protocol,
					port: port,
					host: host,
					storage: storage,	// solo SQLite (.env)
					omitNull: true		// solo Postgres
					}
				);

//Importar la definicion de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

//Importar la definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Importar definicion de la tabla User
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

// los quizes pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

Comment.belongsTo(Quiz);  //indica que los comentarios pertenecen a los quizes
Quiz.hasMany(Comment);	//indica que un quiz puede tener varios comentarios

exports.Quiz = Quiz; //exportar definicion de tabla Quiz
exports.Comment = Comment; //exportar definicion de tabla Comment
exports.User = User; //exportar definicion de tabla User

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
	//success(..) ejecuta el manejador una vez creada la tabla
	//success(..) daba error, hemos tenido que usar tanto aquí como en
	//quiz_controller.js la extension then(...)
	User.count().then(function (count){
		if (count === 0) { //la tabla se inicializa solo si esta vacia
			User.bulkCreate( 
	       	[ {username: 'admin',   password: '1234', isAdmin: true},
          		{username: 'pepe',   password: '5678'} // isAdmin por defecto: 'false'
			]
			).then(function(){
		        console.log('Base de datos (tabla user) inicializada');
		        Quiz.count().then(function (count){
			        if(count === 0) {   // la tabla se inicializa solo si está vacía
			            Quiz.bulkCreate(  //estos quizes se generan como creados por 'pepe' (user:2)
			            [ {pregunta: 'Capital de Italia',   respuesta: 'Roma', UserId: 2},
			                {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2}
			            ]
			            ).then(function(){console.log('Base de datos (tabla quiz) inicializada')});
			        };
		        });
			});
		};
	});
});