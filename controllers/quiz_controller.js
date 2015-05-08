var models = require('../models/models.js');

// Autoload - factoriza el codigo su ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else {
				next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) { next(error);});
};

// GET /quizes?search=texto_a_buscar
exports.search = function(req, res) {
	var busqueda= req.query.busqueda || '';
  	var busqueda_like="%"+busqueda.replace(/ +/g, "%")+"%";
	models.Quiz
	.findAll({where: ["pregunta like ?", busqueda_like, busqueda_like],
		order: 'updatedAt DESC'
		})
	.then(function(quizes){
		res.render('quizes/search',{
			quizes: quizes
		});
	})
	.error(function(error){
		console.log("Error: No se puede buscar en los quizes.");
		res.redirect('/');
	});

}

// GET /quizes
exports.index = function(req, res) {
	models.Quiz.findAll().then(function(quizes){
		res.render('quizes/index', { quizes: quizes});
	})
	.catch(function(error) { next(error);});
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado = 'Correcto';
	}
	res.render('quizes/answer',
			{ quiz: req.quiz, respuesta: resultado});
};