var lecture = 1;

$(document).on(	"keyup",
								"body",
								function(leContexe){
	// console.log(leContexe);
	// Appui sur ESC 
	if(leContexe.key == "Escape" ) {
		//TODO : parcourir tous les textarea, les annuler -> backend dejean 
		// Pour chacun d'eux, récupérer le contenu initial 
		// replacer dans le DOM un P avec ce contenu 
		// utiliser .each() 
		$("#paragraphes textarea").each(function(){
			// Annuler l'édition en cours 
			// $(this) dénote à chaque itération une référence vers l'un des textarea
			
			var contenuPrecedent = $(this).data("contenu");
			var metaT = $(this).data(); 
			var jP = $("<p>").html(contenuPrecedent).data(metaT);
			$(this).replaceWith(jP);
		});
	}
});

$(document).on(	"click",
				"#paragraphes p",
				function (){
	if ($("#btnLectureEdition").hasClass('enEdition')){
	// clic sur un futur P. 
	var contenuP = $(this).html();
	var metaP =  $(this).data(); 
	// préparer le futur textarea
	var jT = $("<textarea>")
						.val(contenuP)
						.data(metaP);  

	// insertion dans le DOM 
	$(this).replaceWith(jT);
	}
});

$(document).on(	"keydown",
				"#paragraphes textarea",
				function(leContexe){
	// Validation d'une saisie
	if(leContexe.which == 13 ) {
		// On prépare le nouveau P.
		var contenuT = $(this).val();
		var metaT = $(this).data(); 
		var jP = $("<p>").html(contenuT).data(metaT);

		// On met à jour ses méta-données 
		// car le contenu a changé
		jP.data("contenu",contenuT);
	
		//On envoie une requete au serveur 
		$.getJSON(	"data.php", 
								{	"action" : "updateP", 
									"id": metaT.id, 
									"contenu" : contenuT}, 
								function (oRep){
			if (oRep.feedback!="ok") {
				alert("Rechargez votre navigateur...");
			}
		});

		// On l'insère 
		$(this).replaceWith(jP);
	}
});


// TODO: afficher dans la console les méta-données
// lors du survol des P.  
$(document).on(	"mouseover",
				"#paragraphes div p, #paragraphes div textarea",
				function(){
	// Survol d'un elt dans le div des p. 
	// $(this) dénote l'élément manipulé 
	// On affiche ses méta-données 
	console.log($(this).data());
});

// TODO: ne pas perdre les méta-données des P. en cours d'édition 
// TODO : envoyer une requete de mise à jour lors de la modification d'un P. 
// TODO UX : permettre une annulation des éditions en cours
// lors de l'appui sur ESC, on annule toutes les éditions
// en replacant les contenus initiaux dans chaque P. en cours d'édition [besoin éventuel de l'itérateur .each()]


function afficherModeEdition() {

	// Envoyer une requete au serveur pour récupérer les P. 
	// en base de données 
	$.getJSON(	"data.php",
							{"action":"getP"},
							function (oRep){

/* {"feedback":"ok","paragraphes":[{"id":"1","contenu":"premier","ordre":"1"},...]} */
		console.log(oRep);
		
		if (oRep.feedback != "ok") {
			alert("Erreur, veuillez recharger votre navigateur");
		} else {
			// on les intègre au div des paragraphes 
			for(i=0;i<oRep.paragraphes.length;i++) {
				// oRep.paragraphes[i] contient les méta-données
				// du paragraphe i : id, contenu, ordre 
				// TODO: insérer les P. 
				var jP = $("<p>")
									.html(oRep.paragraphes[i].contenu);
				// ON change la structure... <div><span><p>
				var jS = $("<div><span class=\"poignee ui-icon ui-icon-arrow-4\"></span></div>");
				jS.append(jP);
				$("#paragraphes").append(jS);

				// TODO: y associer leurs méta-données 
				jP.data(oRep.paragraphes[i]);

//			jP.data("id",oRep.paragraphes[i].id);
//			jP.data("contenu",oRep.paragraphes[i].contenu);
//			jP.data("ordre",oRep.paragraphes[i].ordre);
			}
		}
	}); 

	// Insérer un bouton + avant le div des paragraphes
	var btnAjouterParagraphe = $("<input type='button' class='dansBarreEdition' id='btnAjouterParagraphe'/>")
						.val("+")
						.click(function(){
		// Ordre du futur P. ? 
		// ordre du premier des P. actuels - 1
		var jPremier = $("#paragraphes *:first-child");
		// $("#paragraphes *").first()		
		// $("#paragraphes *:first-child"); 
		// ATTENTION AUX PERFORMANCES !
		var ordreNouveau = jPremier.data("ordre") - 1;
		// Attention au cas avec '+' : il faut vérifier 
		// les types des éléments : 
		// "1" +1  vaut "11"!!

		// Lors du clic sur un bouton, 
		// On insère le P. dans le DOM 
		var contenu = $(this).next().val();
		var jP = $("<p>")
							.html(contenu)
							.data({	"id" : 0, 
											"ordre" : ordreNouveau, 
											"contenu" : contenu });

		// ON change la structure... <div><span><p>
		var jS = $("<div><span class=\"poignee ui-icon ui-icon-arrow-4\"></span></div>");
		jS.append(jP);
		$("#paragraphes").prepend(jS);

		// On envoie une req. de création au serveur 
		// CONTRAINTE : permettre plusieurs ajouts à la fois 
		// => pas de var. globale !

		// SOL2 : on utilise un appel à $.getJSON
		// comme jP est dans le scope de la fonction de rappel
		// On peut s'en servir pour modifier le P. adéquat
		// jP.html(oRep.id); 
		$.getJSON(	"data.php", 
								{	"action":"addP",
									"ordre": ordreNouveau, 
									"contenu" : contenu}, 
								function (oRep) {
			jP.data("id",oRep.id);
		}
); 

	});

	// // Mise de  la barre de recherche et du bouton 'Search' dans le div menuDeroulant
	// $("#menuDeroulant").prepend(btnAfficherArticles);			

	// // insertion bouton search avant 
	// btnAfficherArticles.before("<input type='text' value='Rechercher article'/>");

	// insertion bouton avant paragraphes
	$("#paragraphes").before(btnAjouterParagraphe);
	// On pourrait cloner avec .clone()

	// insertion champ entrée texte apres bouton
	btnAjouterParagraphe.after("<input type='text' class='dansBarreEdition' value='Nouveau Paragraphe'/>");

	$(".dansBarreEdition").wrapAll("<div class='barreEdition'></div>")	
};

//$(document).ready(function(){var lecture = 1;});

$(function() {
	// Dropdown toggle
	$('.menuDeroulant').click(function(){
		// TODO fonction dejean qui va chercher les titres d'articles et les mets dans l'ul '.listeArticles' selon <li><a id='MenuItem'>Menu Item</a></li>
	  $(this).next('.listeArticles').toggle();
	});

	$(document).click(function(e) {
	  var target = e.target;
	  if (!$(target).is('.menuDeroulant') && !$(target).parents().is('.menuDeroulant')) {
	    $('.listeArticles').hide();
	}

	    // Affichage de l'article sur lequel on clique
	  if ($(target).parent().parent().is('.listeArticles')) {
	  	var titreArticle = target.id;
	  	// $('#relatifAuxArticles').after('<h2 id="titreArticle">' + titreArticle + '</h2>');
	  	// $('#titreArticle').before('<button id="btnLectureEdition" class="ui-state-default ui-corner-all">Passer en mode edition</button>');
	  	if ($("#titreArticle").length) {$("#titreArticle").text(titreArticle); // S'il y a déjà un article ouvert
			$("#paragraphes").children().remove();
			if($(".barreEdition").length) {$(".barreEdition").remove();}
			$("#btnLectureEdition").text("Passer au mode edition");
		}
		else { // Si aucun article ouvert
			$('#relatifAuxArticles').after('<h2 id="titreArticle">' + titreArticle + '</h2>');
	  		$('#titreArticle').before('<button id="btnLectureEdition" class="ui-state-default ui-corner-all">Passer en mode normal</button>');
	  		$("#btnLectureEdition").text("Passer au mode edition");
		}
	  	// TODO : Affichage de l'article ayant comme id target.id

	  	}

	  });

	// $('body').one("click", "#btnLectureEdition", function(){
	// 	// passage pour la première fois au mode edition
	// 	afficherModeEdition();
	// });


	// Action lorsque je clique sur le bouton Nouvel Article
	$('body').on("click", "#btnAjoutArticle", function(){
		// Si on est déjà sur un article
		if ($("#titreArticle").length) {$("#titreArticle").text($("#titreNouvelArticle").val());
			$("#btnLectureEdition").addClass($("#btnLectureEdition").attr("class") + ' enEdition nouvelArticle');
			$("#paragraphes").children().remove();
			if($(".barreEdition").length) {$(".barreEdition").remove();}
			$("#btnLectureEdition").text("Revenir au mode normal");
			afficherModeEdition();}
		else {
			$('#relatifAuxArticles').after('<h2 id="titreArticle">' + $("#titreNouvelArticle").val() + '</h2>');
	  		$('#titreArticle').before('<button id="btnLectureEdition" class="ui-state-default ui-corner-all enEdition nouvelArticle">Passer en mode normal</button>');
	  		$("#btnLectureEdition").text("Revenir au mode normal");
	  		afficherModeEdition();
		}
	});

	// Action lorsque je clique sur le bouton Lecture/Edition
  	$('body').on("click", "#btnLectureEdition", function(){
	var btnLectEd = $(this);
	if($('#btnLectureEdition').hasClass("nouvelArticle")){ // on est en présence d'un nouvel article
		$('#btnLectureEdition').toggleClass('nouvelArticle');
	}

	if (!btnLectEd.hasClass('enEdition')) {
		// On passe en mode edition
		btnLectEd.text("Revenir au mode normal");
		$(".barreEdition").show();
		$('#paragraphes span').show();
		$('#paragraphes textarea').show();
		afficherModeEdition();
		btnLectEd.toggleClass('enEdition');
	}

	else {
			// On passe en mode lecture
			btnLectEd.text("Passer en mode edition");
			$(".barreEdition").remove();
			$('#paragraphes span').hide();
			$("#paragraphes").append('<div><p>Mon paragraphe</p></div>'); // TODO : paragraphes pas encore éditables
			$('#paragraphes textarea').remove();
			btnLectEd.toggleClass('enEdition');
		}

	});

	// // Action lorsque j'appui sur le bouton "Ajouter un paragraphe"
	// $('body').on("click", "btnAjouterParagraphe", function(){})

});




$(document).ready(function(){
	// Attention : un clic pour déplacer reste un clic sur un P. (permettant d'éditer) 
	// => On change la structure 
	// 	<div>
	//		<span>poignee</span>
	//		<p>contenu</p>
	//	</div>
	$("#paragraphes").sortable({	handle: ".poignee", 
																helper: "clone", 
																placeholder: "emplacement", 
																stop: function( event, ui ) {
				console.log("id de l'item modifie : ");
				console.log($("p",ui.item).data("id"));

				console.log("ordre de l'element precedent : ");

				console.log($("p",ui.item.prev()).data("ordre"));

				console.log("ordre de l'element suivant : ");
				console.log($("p",ui.item.next()).data("ordre"));
				
			
		}
	});
	$("#paragraphes").disableSelection(); 
		// Interdit la sélection de texte à la souris
});