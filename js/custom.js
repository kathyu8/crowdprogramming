jQuery.fn.exists = function(){return jQuery(this).length>0;}

// Disable function
jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});

var training_num = 0;
var picture_num = 0;
var TOTAL_TRAINING = 2;
var TOTAL_PICTURES = 7;

// Example Warnings
function example_submit(submit, form, input, value) {
	submit.click(function(e){
		e.preventDefault();
		
		if($(".alert").exists()) {
			$(".alert").remove();
		}

		if(input.val() != value){
			form.append("<div class='alert alert-danger' role=[alert]>That is not the correct answer. Count again.</div>");
		}

		else {
			form.append("<div class='alert alert-success' role=[alert]>Correct!</div>");
			training_num++;
			submit.disable(true);
			if(training_num == TOTAL_TRAINING) {
				$("#next_button").disable(false);	
			}
		}
	});
}

example_submit($("#example_submit_1"), $("#example_form_1"), $("#example_input_1"), 5, true);
example_submit($("#example_submit_2"), $("#example_form_2"), $("#example_input_2"), 8, true);

// Hide Current and Show Next Picture
function task_submit(submit, input_field, form, picture_num){
	submit.click(function(e){
		e.preventDefault();

		if($(".alert").exists()) {
			$(".alert").remove();
		}

		if(input_field.val() <= 0 || !parseInt(input_field.val(), 10)){
			form.append("<div class='alert alert-danger' role=[alert]>You must put in an integer.</div>");
		}
		else { 
			console.log("Picture " + picture_num + ": " + input_field.val());
			$("#picture_" + picture_num).hide();
			$("#picture_" + (picture_num + 1)).show();
			setTimeout(function(){
				$("#picture_submit_" + (picture_num+1)).disable(false);
			}, 2000);
		}
	})
}

// Attach Submit listener and hide other pictures
for(i = 1; i <= TOTAL_PICTURES; i++){
	if(i != 1){
		$("#picture_"+i).hide();
	}
	if(i != TOTAL_PICTURES){
		task_submit($("#picture_submit_" + i), $("#form_input_" + i), $("#task_form_" + 1), i);
	}	
}

setTimeout(function(){
	$("#picture_submit_1").disable(false);
}, 2000);