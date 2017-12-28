// Fichier contenant toutes les interactions sur la page des articles en jquery


// Action d'annulation de la modification des paragraphes après un clic sur ESC
$(document).on(	"keyup",
				"body",
				function(leContexe){
	// Appui sur ESC
	if(leContexe.key == "Escape" ) {
		// Pour chacun d'eux, récupérer le contenu initial, replacer dans le DOM un P avec ce contenu 
		$("#paragraphes textarea").each(function(){
			// Annuler l'édition en cours TODO			
			var contenuPrecedent = $(this).data("contenu");
			var metaT = $(this).data(); 
			var jP = $("<p>").html(contenuPrecedent).data(metaT);
			$(this).replaceWith(jP);
		});
	}
});


// Fonction affichant le mode edition d'un paragraphe
function affichageEditionParagraphe(thisPar) {
		var contenuParagraphe = thisPar.html();
		var metaP =  thisPar.data();
		var jT = $("<textarea>")
							.val(contenuParagraphe)
							.data(metaP);  
		// insertion du textarea dans le DOM 
		thisPar.replaceWith(jT);
		thisPar.focus();
}


// Action lors d'un clic sur un paragraphe
$(document).on(	"click",
				"#paragraphes p",
				function (){
	if ($("#btnLectureEdition").hasClass('enEdition')){
		// Passage en mode édition lors du clic sur un paragraphe
		affichageEditionParagraphe($(this));
		}
});


// Action lorsque Entree est presse
$(document).on(	"keydown",
				"#paragraphes textarea",
				function(leContexe){
	if(leContexe.which == 13 ) {
		// On prépare le nouveau paragraphe lors de l'appui sur entree
		var contenuT = $(this).val();
		var metaT = $(this).data(); 
		var jP = $("<p>").html(contenuT).data(metaT);

		// Mise à jour des méta-données
		jP.data("contenu",contenuT);
	
		// Envoi de requete au serveur 
		$.getJSON(	"data.php", 
					{"action" : "updateP", 
					"id": metaT.id, 
					"contenu" : contenuT}, 
					function (oRep){
			if (oRep.feedback!="ok") {
				alert("Rechargez votre navigateur...");
			}
		});

		// Insertion de la saisie
		$(this).replaceWith(jP);
	}
});

// Action lors du survol des paragraphes  
$(document).on(	"mouseover",
				"#paragraphes div p, #paragraphes div textarea",
				function(){
	// Affichage des meta donnees d'un paragraphe dans la console
	console.log($(this).data());
});


// Fonction permettant de passer en mode Edition
function afficherModeEdition() {

	// Envoyer une requete au serveur pour récupérer les P. en bdd
	$.getJSON(	"data.php",
							{"action":"getP"},
							function (oRep){

/* {"feedback":"ok","paragraphes":[{"id":"1","contenu":"premier","ordre":"1"},...]} */
		console.log(oRep);
		
		if (oRep.feedback != "ok") {
			alert("Erreur, veuillez recharger votre navigateur");
		} 
		else {
			// on les intègre au div des paragraphes 
			for(i=0;i<oRep.paragraphes.length;i++) {
				// oRep.paragraphes[i] contient les méta-données du paragraphe i : id, contenu, ordre 
				var jP = $("<p>").html(oRep.paragraphes[i].contenu);
				// ON change la structure... <div><span><p>
				var jS = $("<div><span class=\"poignee ui-icon ui-icon-arrow-4\"></span></div>");
				jS.append(jP);
				$("#paragraphes").append(jS);

				jP.data(oRep.paragraphes[i]);
			}
		}
	}); 

	// Insérer un bouton + avant le div des paragraphes
	var btnAjouterParagraphe = $("<input type='button' class='dansBarreEdition' id='btnAjouterParagraphe'/>")
						.val("+")
						.click(function(){
		// Ordre du futur P. : ordre du premier des P. actuels - 1
		var jPremier = $("#paragraphes *:first-child");
		var ordreNouveau = jPremier.data("ordre") - 1;

		// Lors du clic sur un bouton, on insère le paragraphe dans le DOM
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

		// Envoi d'une req. de création au serveur 
		$.getJSON(	"data.php", 
					{"action":"addP",
					"ordre": ordreNouveau, 
					"contenu" : contenu},
					function (oRep) {jP.data("id",oRep.id);}
				);

		affichageEditionParagraphe(jP);

	});

	// insertion bouton avant paragraphes
	$("#paragraphes").before(btnAjouterParagraphe);

	// insertion champ entrée texte apres bouton
	btnAjouterParagraphe.after("<input type='text' class='dansBarreEdition' value='Nouveau Paragraphe'/>");

	$(".dansBarreEdition").wrapAll("<div class='barreEdition'></div>");

	// // Change le css des paragraphes 
	// $("#paragraphes p").hover(function() {
 //  		$(this).css("cursor","pointer");
 //  		$(this).css("border","border:1px solid black");
 //  		console.log('atchoulm');
	// });
};



// Fonction de mise en place du menu deroulant
$(function() {
	$('.menuDeroulant').click(function(){
	// TODO fonction dejean qui va chercher les titres d'articles et les mets dans '.listeArticle'
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

	  	if ($("#titreArticle").length) {
	  		// S'il y a déjà un article ouvert
	  		$("#titreArticle").text(titreArticle);
			$("#paragraphes").children().remove();
			if($(".barreEdition").length) {$(".barreEdition").remove();}
			$("#btnLectureEdition").text("Passer au mode edition");
			// TODO : Affichage de l'article ayant comme id target.id
		}

		else { 
			// Si aucun article ouvert
			$('#relatifAuxArticles').after('<h2 id="titreArticle">' + titreArticle + '</h2>');
	  		$('#titreArticle').before('<button id="btnLectureEdition" class="ui-state-default ui-corner-all">Passer en mode normal</button>');
	  		$("#btnLectureEdition").text("Passer au mode edition");
	  		// TODO : Affichage de l'article ayant comme id target.id
			}
	  	}
	  });


	// Action lorsque je clique sur le bouton Nouvel Article
	$('body').on("click", "#btnAjoutArticle", function(){
		if ($("#titreArticle").length) {
			// Si on est déjà sur un article
			$("#titreArticle").text($("#titreNouvelArticle").val());
			$("#btnLectureEdition").addClass($("#btnLectureEdition").attr("class") + ' enEdition nouvelArticle');
			$("#paragraphes").children().remove();
			if($(".barreEdition").length) {$(".barreEdition").remove();}
			$("#btnLectureEdition").text("Revenir au mode normal");
			afficherModeEdition();
		}

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
	if($('#btnLectureEdition').hasClass("nouvelArticle")){ 
		// Si on est en présence d'un nouvel article
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
		// TODO : paragraphes pas encore éditables
		$('#paragraphes textarea').remove();
		btnLectEd.toggleClass('enEdition');
		}
	});

});


$(document).ready(function(){
	$("#paragraphes").sortable({handle: ".poignee", 
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