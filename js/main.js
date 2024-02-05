var path = '';
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

$(document).ready( function() {
    scroll();
    $(window).scroll( function() {
        scroll();
    })
    $(".fancybox").fancybox();

    $("input,textarea").each(function() {
        if( $(this).val() != '' ) {
            $(this).parent().addClass("focused");
        }
    })
    $("body").on("focus", "input,textarea", function() {
        if( !$(this).parent().hasClass("focused") ) {
            $(this).parent().addClass("focused");
        }
    }).on("blur", "input, textarea", function() {
        if( $(this).parent().hasClass("focused") && $(this).val() == '' ) {
            $(this).parent().removeClass("focused");
        }
    })

    $(".indexSlider .owl-carousel").owlCarousel({
        items: 1,
        autoWidth: false,
        nav: true,
        dots: true,
        lazyLoad: true,
        loop: true,
        responsive : {
            0 : {
                nav: false
            }, 
            1300 : {
                nav: true,
            }
        }
    });
    if( $("#orderCategs").length > 0 ) {
        var owl = $("#orderCategs").owlCarousel({
            items: 1,
            dots: false,
            loop: false,
            dots: true,
            dotsContainer: '#carousel-order-dots',
            autoHeight: true,
            mouseDrag: false,
            touchDrag: false,
            pullDrag: false
        });
        $('.owl-dot').click(function () {
            owl.trigger('to.owl.carousel', [$(this).index(), 300]);
            return false;
        });
    }
    if( $("#orderCateg1,#orderCateg2").length > 0 ) {
        if( $(window).width() < 1000 ) {
            $("#orderCateg1,#orderCateg2").addClass('owl-carousel');
            $("#orderCateg1,#orderCateg2").owlCarousel({
                autoWidth: true,
                dots: false,
                dots: false,
                autoHeight: true,
                mouseDrag: true,
                touchDrag: true,
                pullDrag: true
            });
        }
    }

    resize();
    $( window ).resize(function() {
        resize();
    })
})
$(window).on('load', function() {
    if( $("#contactsMap").length > 0 && $(window).width() > 650 ) {
        $("body").append('<script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU&onload=contactsmapload" type="text/javascript"></script>');
    }
})
function contactsmapload() {
    var myMap = new ymaps.Map('contactsMap', {
        center: [59.93706606416862,30.64121099999988],
	    zoom: 16,
        controls: []
   	});
    myMap.controls.add('zoomControl');
    myMap.controls.add('rulerControl', {
        scaleLine: false
    });

    myPlacemark = new ymaps.Placemark( [59.93706606416862,30.64121099999988], {
        balloonContent: 'ООО &laquo;Локс&raquo;'
    }, {
        preset: 'islands#dotIcon',
        iconColor: '#d90028'
    })
    myMap.geoObjects.add(myPlacemark);
}
function scroll() {
    var scrolled = window.pageYOffset || document.documentElement.scrollTop;
}
function resize() {
    
}