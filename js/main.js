
(function($) {
$(document).ready( function() {
// init scrollspy
$('body').scrollspy({ target: '#main-nav' });
// init scroll-to effect navigation, adjust the scroll speed in milliseconds
$('#main-nav').localScroll(1000);
$('#header').localScroll(1000);
// google maps

// form validation
 $('#mycarousel').jcarousel();
		 var mapObj = new mapOperate("mapContainer");
		 mapObj.search("桂林西街111弄29号","上海");
// ajax contact form
$('.contact-form form').submit( function(e) {
e.preventDefault();
$theForm = $(this);
	var content = '姓名:'+$('#name').val()+'</br>邮件地址:'+$('#email').val()+'</br>主题:'+$('#subject').val()+'</br>信息:'+$('#message').val();
		 	if($('.help-lock').hasClass('has-success')){
		 		return	false;
		 	}
		 	 $.ajax({
				'url':'http://notepad.shnow.cn/email.php',
				'type':"post",
				'data':{rec:"guowei@shnow.cn",'title':$('#subject').val(),'content':content,'passwd':"citylpd"},
				'beforeSend':function(){
					$('.shadow_bg').show();
					$('.loading').show();
				},
				'complete':function(data){
					$('.shadow_bg').hide();
					$('.loading').hide();
					$('.help-lock').addClass('has-success').val('感谢您的关注，已发送成功');
					$('form input:text').val('');
					$('form textarea').val('');
				}
			});
});
});
})(jQuery);