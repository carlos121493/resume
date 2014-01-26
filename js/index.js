require.config({
	baseUrl:"js/lib",
	paths:{
		"jquery":"jquery"
	}
})
require(['jquery'],function($){
	$('head').append('<script src="js/lib/bootstrap.min.js"></script>');
	$('head').append('<script src="js/custom.js"></script>');
		
});