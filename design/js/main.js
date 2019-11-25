$(document).ready(function() {
	$('.form-block').dsform({
		formID : 'dsrequest',
		modal : false,
		useFormStyler: true,
	});
	$('.js-menu').click(function(){
		$('.menu-nav').addClass('is-open');
		$('#overlay').addClass('is-open');
	});
	$('.js-close').click(function(){
		$('.menu-nav').removeClass('is-open');
		$('#overlay').removeClass('is-open');
	});
	$('.js-toggle span').click(function(){		
		if ($(this).parent('.js-toggle').hasClass('show-more-advantage')){
			$('.advantage-item').toggleClass('is-open');
			$(this).html($(this).html() == 'Все преимущества' ? 'Свернуть' : 'Все преимущества'); 
		}else{
			$('.service-item').toggleClass('is-open');
			$(this).html($(this).html() == 'Все услуги' ? 'Свернуть' : 'Все услуги'); 
		}

	});
	$('.slider-list').owlCarousel({
		items: 1,
		dots: true,
		loop: true,
		nav: false,
	});	
	$('.price-carusel').owlCarousel({
		items: 4,
		dots: false,
		loop: true,
		nav: true,
		margin:20,
		responsive:{
			0:{
				items:1, 
				margin:0,           
			},
			640:{
				items:2,            
			},
			960:{
				items:3,            
			},
			1200:{
				items:4,            
			}
		}
	});
	$('.portfolio-carousel').owlCarousel({
		items: 3,
		dots: false,
		loop: true,
		nav: true,
		margin:20,
		responsive:{
			0:{
				items:1,  
				margin:0,          
			},
			640:{
				items:2,            
			},
			960:{
				items:3,            
			}
		}
	});	
	$('.reviews-carousel').owlCarousel({
		items: 3,
		dots: false,
		loop: true,
		nav: true,
		margin:20,
		responsive:{
			0:{
				items:1,   
				margin:0,         
			},
			640:{
				items:2,            
			},
			960:{
				items:3,            
			}
		}
	});	
	$("#menu").on("click","a", function (event) {
		event.preventDefault();
		$('.menu-nav').removeClass('is-open');
		$('#overlay').removeClass('is-open');
		var id  = $(this).attr('href'),
		top = $(id).offset().top;
		$('body,html').animate({scrollTop: top}, 1500);
	});
	$('.page-link').click(function(){
		event.preventDefault();
		var id  = $(this).attr('href'),
		top = $(id).offset().top;
		$('body,html').animate({scrollTop: top}, 1500);
	});
	$('.js-request').click(function(){
		event.preventDefault();
		var id  = '#request',
		top = $(id).offset().top;
		$('body,html').animate({scrollTop: top}, 1500);
	});
	$('.reviews-link span').click(function(){
		var txt = $(this).parents('.reviews-item').find('.reviews-hdn').html();
		$.fancybox.open(txt);
	});
	$('.portfolio-link span').click(function(){
		var txt = $(this).parents('.portfolio-item').find('.portfolio-hdn').html();
		$.fancybox.open(txt);
	});
	$('.animate-menu-item').click(function(){
		if(window.matchMedia('(min-width: 1200px)').matches){
			var item = '#'+$(this).attr('data-add');
			var element = $(item).offset().top;	
			var text = $(item).find('.table-hidd').html();
			$('.service-item-price-0, .service-item-price-1, .service-item-price-2').html();
			$('.service-item-price-0, .service-item-price-1, .service-item-price-2').hide();
			if(item =='#service_4' || item =='#service_11' || item =='#service_5' || item =='#service_6'){
				$('.service-item-price-0').show();
				$('.service-item-price-0').html(text);
			}
			if(item =='#service_12' || item =='#service_13' || item =='#service_14' || item =='#service_15'){
				$('.service-item-price-1').show();
				$('.service-item-price-1').html(text);
			}
			if(item =='#service_33'){
			$('.service-item-price-2').show();
			$('.service-item-price-2').html(text);
		}
			$('body,html').animate({scrollTop: element}, 1500);
		}		
	});
	$('.service-item').click(function(){
		var item = $(this).attr("id");
		var text = $(this).find('.table-hidd').html();
		var headerHeight = (window.matchMedia('(min-width: 1200px)').matches) ? 90 : 0;
		$('.service-item-price-0, .service-item-price-1, .service-item-price-2').html();
		$('.service-item-price-0, .service-item-price-1, .service-item-price-2').hide();
		if(item =='service_4' || item =='service_11' || item =='service_5' || item =='service_6'){
			$('.service-item-price-0').show();
			$('.service-item-price-0').html(text);
			$('body,html').animate({scrollTop: $('.service-item-price-0').offset().top - headerHeight}, 1000);
		}
		if(item =='service_12' || item =='service_13' || item =='service_14' || item =='service_15'){
			$('.service-item-price-1').show();
			$('.service-item-price-1').html(text);
			$('body,html').animate({scrollTop: $('.service-item-price-1').offset().top - headerHeight}, 1000);
		}
		if(item =='service_33'){
			$('.service-item-price-2').show();
			$('.service-item-price-2').html(text);
			$('body,html').animate({scrollTop: $('.service-item-price-2').offset().top - headerHeight}, 1000);
		}
	});
	$(function() {
		$(window).scroll(function() {
			if($(this).scrollTop() != 0) {
				$('#toTop').fadeIn();
			} else {
				$('#toTop').fadeOut();
			}
		});
		$('#toTop').click(function() {
			$('body,html').animate({scrollTop:0},800);
		});
	});
	var nav = $('.fixed-header');
	$(window).scroll(function () {
		if ($(this).scrollTop() > 120) {
			nav.addClass("f-nav");
		} else {
			nav.removeClass("f-nav");
		}
	});
});