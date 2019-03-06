
function isEmpty(value){
	if(value == null || value == undefined || value == "" || value.length == 0){
		return false;
	}
}
function verifyNumber(nbr){
	isEmpty(nbr);
	return /^\d+$/.test(nbr);
}
function verifyString(str){
	isEmpty(str);
	var re = /^[A-Za-z]+$/;
    return re.test(str);
}
function verifyEmail(email){
	isEmpty(email);
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
} 
function verifyDate(date){
	isEmpty(date);
	var date1 = new Date().setHours(0,0,0,0); 
	var date2 = new Date(date).setHours(0,0,0,0);
	if(date2 >= date1){
		return false;
	}
}
function verifyFields(){
	prenom.onblur = function() {
	  if (verifyString($('#prenom').val()) == false) {
		prenom.classList.add('invalid');
		errorPrenom.innerHTML = 'caractères spéciaux non autorisés !';
	  }
	};

	prenom.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		// remove the "error" indication, because the user wants to re-enter something
		this.classList.remove('invalid');
		errorPrenom.innerHTML = "";
	  }
	};

	nom.onblur = function() {
	  if (verifyString($('#nom').val()) == false) {
		nom.classList.add('invalid');
		errorNom.innerHTML = 'caractères spéciaux non autorisés !';
	  }
	};

	nom.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorNom.innerHTML = "";
	  }
	};

	datetimepicker.onblur = function() {
	  if (verifyDate($('#datetimepicker').val()) == false) {
		datetimepicker.classList.add('invalid');
		errorDate.innerHTML = "La date n'est pas valide !";
	  }
	};

	datetimepicker.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorDate.innerHTML = "";
	  }
	};	

	email.onblur = function() {
	  if (!verifyEmail($('#email').val())) {
		email.classList.add('invalid');
		errorEmail.innerHTML = "e-mail n'est pas valide !";
	  }
	};

	email.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorEmail.innerHTML = "";
	  }
	};
	
	phone.onblur = function() {
	  if (!verifyNumber($('#phone').val())) {
		phone.classList.add('invalid');
		errorPhone.innerHTML = "numéro n'est pas valide !";
	  }
	};

	phone.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPhone.innerHTML = "";
	  }
	};
	
disableSubmitIfError();
}

function verifyPassword(){
	$("#password").blur(function(){
		if($("#password").val().length < 6){
			$("#password").addClass('invalid');
			errorPassword1.innerHTML = 'Mot de passe au minimum 6 charactéres !';
		}
	});	
	$("#password").focus(function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPassword1.innerHTML = "";
	  }
	});

	$("#confirmpassword").blur(function(){
		if($("#password").val() !== $("#confirmpassword").val()){
			$("#confirmpassword").addClass('invalid');
			errorPassword2.innerHTML = "Mot de passe incorrect !";
		}
	});
	$("#confirmpassword").focus(function() {
		if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPassword2.innerHTML = "";
	  }
	});
disableSubmitIfError();
}
  
function isEmptyArray(tab){
	for (var i = 0; i < tab.length; i++) {
		if(isEmpty($(tab[i]).val()) == false){
			return false;
		}
	}
}
function disableSubmitIfError(){
	//['#errorNom', '#errorPrenom', '#errorDate', '#errorEmail', '#errorPassword1', '#errorPassword2']
	const errors = ['#errorNom', '#errorPrenom', '#errorDate', '#errorEmail', '#errorPassword1', '#errorPassword2'];
	if(isEmptyArray(errors) == false){
		$("#valider").attr("disabled", "disabled");
		return false;
	}
}
