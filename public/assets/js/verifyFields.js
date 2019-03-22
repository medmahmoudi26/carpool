
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
		disableSubmitIfError();
	  }
	};

	prenom.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		// remove the "error" indication, because the user wants to re-enter something
		this.classList.remove('invalid');
		errorPrenom.innerHTML = "";
		disableSubmitIfError();
	  }
	};

	nom.onblur = function() {
	  if (verifyString($('#nom').val()) == false) {
		nom.classList.add('invalid');
		errorNom.innerHTML = 'caractères spéciaux non autorisés !';
		disableSubmitIfError();
	  }
	};

	nom.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorNom.innerHTML = "";
		disableSubmitIfError();
	  }
	};

	datetimepicker.onblur = function() {
	  if (verifyDate($('#datetimepicker').val()) == false) {
		datetimepicker.classList.add('invalid');
		errorDate.innerHTML = "La date n'est pas valide !";
		disableSubmitIfError();
	  }
	};

	datetimepicker.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorDate.innerHTML = "";
		disableSubmitIfError();
	  }
	};

	email.onblur = function() {
	  if (!verifyEmail($('#email').val())) {
		email.classList.add('invalid');
		errorEmail.innerHTML = "e-mail n'est pas valide !";
		disableSubmitIfError();
	  }
	};

	email.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorEmail.innerHTML = "";
		disableSubmitIfError();
	  }
	};

	phone.onblur = function() {
	  if (!verifyNumber($('#phone').val())) {
		phone.classList.add('invalid');
		errorPhone.innerHTML = "numéro n'est pas valide !";
		disableSubmitIfError();
	  }
	};

	phone.onfocus = function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPhone.innerHTML = "";
		disableSubmitIfError();
	  }
	};
}

function verifyPassword(){
	$("#password").blur(function(){
		if($("#password").val().length < 6){
			$("#password").addClass('invalid');
			errorPassword1.innerHTML = 'Mot de passe au minimum 6 charactéres !';
			disableSubmitIfError();
		}
	});
	$("#password").focus(function() {
	  if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPassword1.innerHTML = "";
		disableSubmitIfError();
	  }
	});

	$("#confirmpassword").blur(function(){
		if($("#password").val() !== $("#confirmpassword").val()){
			$("#confirmpassword").addClass('invalid');
			errorPassword2.innerHTML = "Mot de passe incorrect !";
			disableSubmitIfError();
		}
	});
	$("#confirmpassword").focus(function() {
		if (this.classList.contains('invalid')) {
		this.classList.remove('invalid');
		errorPassword2.innerHTML = "";
		disableSubmitIfError();
	  }
	});
}
function disableSubmitIfError(){
	const errors = [$('#errorNom').html(), $('#errorPrenom').html(), $('#errorDate').html(), $('#errorEmail').html(), $('#errorPhone').html(), $('#errorPassword1').html(), $('#errorPassword2').html()];
	for (var i = 0; i < errors.length; i++) {
		if(errors[i] != ""){
			$("#valider").attr("disabled", "disabled");
			return false;
		}else{
			$("#valider").removeAttr("disabled");
		}
		
	}
}
