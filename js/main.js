var path = '', map, geocoder, centerCoords = { "lat": 44.66445915, "lng": -63.63587689631258 },
directionsService, directionsRenderer, directionsRenderer2, 
officeCoords = { "lat":44.789464330480726,"lng":-63.681888358860796};

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}
function toHoursAndMin( str ) {
    var sec_num = parseInt(str, 10),
    hours   = Math.floor(sec_num / 3600), hoursText = '',
    minutes = Math.floor((sec_num - (hours * 3600)) / 60), resText = '',
    seconds = sec_num - (hours * 3600) - (minutes * 60);

    if( hours > 0 ) {
        if( hours == 1 ) {
            resText += "1" + "<span>hour</span>";
        } else if( hours < 10 ) {
            resText += hours + "<span>hour</span>";
        } else {
            resText += hours + "<span>hour</span>";
        }
    }
    if( minutes == 1 ) {
        resText += "1" + "<span>min</span>";
    } else if( minutes < 10 ) {
        resText += minutes + "<span>min</span>";
    } else {
        resText += minutes + "<span>min</span>";
    }
    return resText;
}
$(document).ready( function() {
    scroll();
    $(window).scroll( function() {
        scroll();
    })
    initInputFocus();

    //$(".fancybox").fancybox();
    if( $("#orderForm").length > 0 ) {
        $("#orderForm").validate();
    }
    if( $("#formStep1").length > 0 ) {
        $("#formStep1").validate();
    }
    if( $("#phone").length ) {
        $("#phone").mask('+1 000 000 0000', {clearIfNotMatch: true});
    }
    if( $("#contact_onsite_phone").length ) {
        $("#contact_onsite_phone").mask('+1 000 000 0000', {clearIfNotMatch: true});
    }
    $("#zip").mask('AAA AAA', {clearIfNotMatch: true});
    if( $("select").length > 0 ) {
        $("select").select2();
    }
    $("body").on("change", "#made", function() {
        $.get("", {madeid:$(this).val()}, function(data) {
            $("#model").html(data);
            $("#model").removeProp("disabled");
            $("#model").select2("enable")
        });
    })
    if( $("#tip").length > 0 ) {
        $("body").on("change", "#tip", function() {
            recalcOrder();
        })
    }
    $("body").on("keypress", "input,textarea", function(event) {
        var pattern = /[A-Za-z @\.0-9\(\)]/g;
        var key = String.fromCharCode(event.which);
        if( event.keyCode == 16 || event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || pattern.test(key)) {
            return true;
        }
        return false;
    })
    $("body").on("change", "#contact_on_site", function() {
        if( $(this).is(":checked") ) {
            $("#comment").attr("required", true);
            $(".forContactOnSite").show();
        } else {
            $("#comment").attr("required", false);
            $(".forContactOnSite").hide();
        }
    })
    $("body").on("click", "#orderRulesApply", function() {
        if( $("#applyCheck input").is(":checked") ) {
            $("#rulesApply").val("1");
            $("#orderForm").submit();
        } else {
            if( $("#applyCheck .error").length == 0 ) {
                $("#applyCheck").prepend('<label class="error">'+$("#error_apply_check").val()+'</label>');
            }
        }
    })
    Fancybox.bind(".fancybox", {});
    $("body").on("submit", "#orderForm", function() {
        if( $("#formStep1").valid() ) {
            if( $("#rulesApply").val() == 0 ) {
                Fancybox.show([{ src: "#orderRules", type: "inline" }]);
                return false;
            }
        } else {
            $("html,body").animate({'scrollTop': $("#formStep1").offset().top - 30}, 200);
            return false;
        }
    })
    $(".applyPromocode").on("click", function() {
        if( $("#promocode").val() ) {
            $.post("", {'promocode_check':1,'promocode':$("#promocode").val(),}, function(data) {
                $(".item.promocode .error").remove();
                if( data.is_error == 0 ) {
                    $("#calc_promo_discount").val( data.discount );
                    $("#calc_promo_max_dist").val( data.max_dist );
                    $("#calc_promo_work_time_only").val( data.work_time_only );
                    $("#calc_promo_next_day_only").val( data.next_day_only );
                } else {
                    $("#calc_promo_discount").val( 0 );
                    $("#calc_promo_max_dist").val( 0 );
                    $("#calc_promo_work_time_only").val( 0 );
                    $("#calc_promo_next_day_only").val( 0 );

                    $(".item.promocode").append('<label id="promocode-error" class="error" for="promocode">' + data.error_code + '</label>');
                }
                recalcOrder();
            }, 'json');
        }
        //console.log( "return" );
        return false;
    })
    $("#orderCategs a").on("click", function() {
        if( !$(this).hasClass("active") ) {
            var $this = $(this);
            $("#orderCategs a.active").removeClass("active");
            $(this).addClass("active");

            $("#lastSteps").html("");
            $("#lastSteps").addClass("loading");

            $.get( path+'/order/', {'ajax': 'Y', 'subcateg': $(this).attr('data-id')}, function(data) {
                window.history.pushState( "", '', '/order/?subcateg=' + $this.attr('data-id') );
                $("title").html( data.seotitle );
                $("#lastSteps").removeClass("loading");
                $(".selectedSubCategContainer .title b, #orderSelectedService").html( data.subcategname );
                $(".selectedSubCategContainer .content").html( data.subcategcontent );
                $("#orderFormContainer").attr('data-type', data.id);
                $("#lastSteps").html( data.content );
                $("select").select2();
                if( $("#phone").length ) {
                    $("#phone").mask('+1 000 000 0000', {clearIfNotMatch: true});
                }
                if( $("#contact_onsite_phone").length ) {
                    $("#contact_onsite_phone").mask('+1 000 000 0000', {clearIfNotMatch: true});
                }
                $("#zip").mask('AAA AAA', {clearIfNotMatch: true});
                $("#formStep1").validate();
                $("#orderForm").validate();

                getCurrentPos();
                initDatepicker();
                initInputFocus();
            },'json')
        }
        return false;
    })
    $("footer .cookies a.button span").on("click", function() {
        $.cookie( 'accepted_cookies', 1 );
        $("footer .cookies").addClass('deleted');
        return false;
    })
    $("body").on("click",function(e) {
        if( !e.target.closest("nav") && $(window).width() > 1150 ) {
            $("header nav input[type=checkbox]").prop("checked", false);
        }
    }).on("change", "#one_way", function() {
        if( $(this).closest("#orderFormContainer").attr('data-type') == 17 ) {
            if( $(this).is(":checked") ) {
                $(".waiting_time").hide();
                $(".cell.full.notify").hide();
            } else {
                $(".waiting_time").show();
                $(".cell.full.notify").show();
            }
        } else if( $(this).closest("#orderFormContainer").attr('data-type') == 6 ) {
            if( $(this).is(":checked") ) {
                $(".date2, .time2, .break").show();
            } else {
                $(".date2, .time2, .break").hide();
            }
            orderCalc( $("#orderFormContainer").attr('data-type') );
        } else if( $(this).closest("#orderFormContainer").attr('data-type') == 8 ) {
            if( $(this).is(":checked") ) {
                $(".cell.full.notify").show();
            } else {
                $(".cell.full.notify").hide();
            }
        }
    })
    initDatepicker();

    $("header nav input[type=checkbox]").on("change", function() {
        if( $(this).attr('id') && $(this).attr('id') == 'mainNavCheck' ) {
            if( $(this).is(":checked") ) {
                $("body").addClass('noscroll');
            } else {
                $("body").removeClass('noscroll');
            }
        }
        if( $(window).width() > 1150 ) {
            var $this = $(this);
            if( $this.is(":checked") ) {
                $("header nav input[type=checkbox]").each( function() {
                    if( $(this).attr('id') != $this.attr('id') ) {
                        $(this).prop("checked", false);
                    }
                } )
            }
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
        var currentItem = 0;
        if( $(".orderCategCurrentItem").length > 0 ) {
            currentItem = $(".orderCategCurrentItem").index();
        }
        var owl = $("#orderCategs").owlCarousel({
            items: 1,
            dots: false,
            loop: false,
            dots: true,
            startPosition: currentItem,
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
    $("body").on("submit", "#formStep1", function() {
        if( $("#formStep1").valid() ) {
            //console.log("submit");
            orderCalc( $("#orderFormContainer").attr('data-type') );
        }
        return false;
    })
    $("body").on("click", ".selectedSubCateg .content a", function() {
        $(".selectedSubCateg .content").addClass("full");
        $(this).remove();
        return false;
    }).on("click", ".orderStep2 .result .makeOrder", function() {
        $("html,body").animate({'scrollTop': $(".orderStep3 .title").offset().top}, 300 );
        return false;
    })

    resize();
    $( window ).resize(function() {
        resize();
    })
})
$(window).on('load', function() {
    //if( $("#contactsMap").length > 0 && $(window).width() > 650 ) {
        //$("body").append('<script src="http://api-maps.yandex.ru/2.1/?lang=ru_RU&onload=contactsmapload" type="text/javascript"></script>');
    //}
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
function getCurrentPos() {//START FROM HERE
    if( $("#map").length == 0 )
        return false;

	if( window.location.protocol == "https:" && navigator.geolocation ) {
		var options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 5000 };

        //try to get user position
		navigator.geolocation.getCurrentPosition(
	        function(position) {
	        	$("#usercoords").val( position.coords.latitude + "," + position.coords.longitude );
	        	$("#usercoords").attr('data-lat', position.coords.latitude);
	        	$("#usercoords").attr('data-lng', position.coords.longitude);

	        	geocoder = new google.maps.Geocoder();
	        	latlng = { lat: parseFloat(position.coords.latitude), lng: parseFloat(position.coords.longitude) };

	        	geocoder.geocode({ location: latlng }, (results, status) => {
	        	    if (status === "OK") {
	        	    	if( results[0] ) {
	        	    		$("#calcFromField").val( results[0].formatted_address );
	        	    	} else {
	        	    		window.alert("No results found");
	        	    	}
	        	    } else {
	        	      window.alert("Geocoder failed due to: " + status);
	        	    }
	        	});

	        	initMap();
	        }, function(position) {
	        	initMap();
	        }, options
	    );
	} else {
		initMap();
	}
}
function initMap() {
    var center;
    if( $("#usercoords").val() != '' ) {
    	center = { "lat": parseFloat($("#usercoords").attr('data-lat')), "lng": parseFloat($("#usercoords").attr('data-lng')) };
    } else {
    	center = centerCoords;
    }
    //init places suggests
    if( $(".placesSuggest").length > 0 ) {
        const defaultBounds = {
            north: center.lat + 1,
            south: center.lat - 1,
            east: center.lng + 1,
            west: center.lng - 1,
        };
    	$(".placesSuggest").each( function() {
    		var options = {
                  bounds: defaultBounds,
				  fields: ["address_components", "geometry", "icon", "name"],
                  origin: center,
                  strictBounds: false,
    	    };
    		const autocomplete = new google.maps.places.Autocomplete( $(this)[0], options );
    	})
    }
    map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 15,
    });
    $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
}
function orderCalc( type ) {
    if( $("#orderFormContainer button").hasClass("loading") ) {
        return;
    }
    if( $("#longRouteNotify").length > 0 ) {
        $("#longRouteNotify").remove();
    }
    $("#orderFormContainer button").addClass("loading");

    $("#service_type").val( $("#orderFormContainer").attr('data-type') );
    $("#calc_from").val( $("#from").val() );
    $("#calc_to").val( $("#to").val() );
    if( $("#date").length > 0 ) {
        $("#calc_date").val( $("#date").val() );
    } else {
        $("#calc_date").val( "" );
    }
    if( $("#time").length > 0 ) {
        $("#calc_time").val( $("#time").val() );
    } else {
        $("#calc_time").val( "" );
    }
    if( $("#one_way").length > 0 && $("#one_way").is(":checked") ) {
        $("#calc_is_checked").val( 1 );
    } else {
        $("#calc_is_checked").val( 0 );
    }
    if( $("#date2").length > 0 ) {
        $("#calc_date2").val( $("#date2").val() );
    } else {
        $("#calc_date2").val("");
    }
    if( $("#time2").length > 0 ) {
        $("#calc_time2").val( $("#time2").val() );
    } else {
        $("#calc_time2").val("");
    }
    if( $("#rental_time").length > 0 ) {
        $("#calc_duration").val( $("#rental_time").val() );
    } else {
        $("#calc_duration").val("");
    }

    if( type == 3 || type == 4 || type == 5 || type == 6 || type == 8 || type == 9 || type == 10 || type == 15 || type == 17 ) {
        if(!$("#formStep1").valid()) {
            $("#orderFormContainer button").removeClass("loading");
            return;
        }
        if( directionsRenderer != null ) {
            directionsRenderer.setMap(null);
            directionsRenderer = null;
            directionsRenderer2.setMap(null);
            directionsRenderer2 = null;
        }
        directionsService = new google.maps.DirectionsService();

        var polylineOptionsActual = new google.maps.Polyline({
            strokeColor: '#FF0000',
        });

        directionsRenderer = new google.maps.DirectionsRenderer();
        directionsRenderer2 = new google.maps.DirectionsRenderer({polylineOptions: polylineOptionsActual});

        directionsRenderer.setMap( map );
        //directionsRenderer2.setMap( map );

        calculateAndDisplayRoute( type );
    } else if( type == 7 || type == 11 ) {
        var totalCost = 0;
        totalCost = $("#rental_time").val() * $("#orderPricePerHour").val();
        $("#calc_base_amount").val(totalCost);
        $("#orderSelectedDate").html( $("#date").val() );
        $("#orderSelectedTime").html( $("#time").val() );
        $("#orderFormContainer button").removeClass("loading");
        if( $(".orderStep2 .result .makeOrder").length == 0 ) {
            $(".orderStep2 .result").append('<a class="makeOrder" href="#">Make an order</a>');
        }
        recalcOrder();
    }
}

function calculateAndDisplayRoute(type) {
	var totalLength = 0, fromCoords = officeCoords;
	directionsService.route({
    	origin: fromCoords,
    	destination: { query: $("#orderFormContainer #from").val() },
    	travelMode: google.maps.TravelMode.DRIVING,
    }, (response, status) => {
    	if (status === "OK") {
            directionsRenderer2.setDirections( response );
    		totalLength = response.routes[0].legs[0].distance.value*1;
            $("#calc_total_length").val(totalLength);

            if( totalLength*1 > 1200000 ) {
                $("#orderFormContainer button").removeClass("loading");
                $(".orderStep2 .row").append('<div id="longRouteNotify" class="cell full notify warning">\
                    <span>The route is over 1200 km. Please call us on \
                    <a href="tel:+19025931464">+1 902 593 14 64</a>&nbsp;and \
                    we will resolve this issue with you.</span>\
                </div>');
                return;
            }

            if( type == 10 ) {//GAS
                if( totalLength*1 > 200000 ) {
                    var totalCost = $("#orderPriceLongLength").val() * (totalLength/1000).toFixed(2);
                    totalCost += $("#orderPriceBasePriceLongLength").val()*1;
                } else {
                    var totalCost = $("#orderPriceShortLength").val() * (totalLength/1000).toFixed(2);
                    totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                }

                if( totalCost < $("#orderPriceMinPrice").val()*1 ) {
                    totalCost = $("#orderPriceMinPrice").val()*1;
                }
                $("#calc_base_amount").val(totalCost);

                $("#orderFormContainer .duration").html( toHoursAndMin( response.routes[0].legs[0].duration.value ) );

                $("#orderSelectedDate").html( $("#date").val() );
                $("#orderSelectedTime").html( $("#time").val() );

                recalcOrder();

                $("#orderFormContainer button").removeClass("loading");

                if( $(".orderStep2 .result .makeOrder").length == 0 ) {
                    $(".orderStep2 .result").append('<a class="makeOrder" href="#">Make an order</a>');
                }
                return;
            }

            directionsService.route({
                origin: { query: $("#orderFormContainer #from").val() },
                destination: { query: $("#orderFormContainer #to").val() },
                travelMode: google.maps.TravelMode.DRIVING,
            }, (response2, status) => {
                if (status === "OK") {
                    let fromOrigToDestLength = response2.routes[0].legs[0].distance.value*1;
                    totalLength += ( fromOrigToDestLength*1 );
                    directionsRenderer.setDirections( response2 );
                    //console.log( "fromOrigToDestLength = " + fromOrigToDestLength );
                    //console.log( "totalLength = " + totalLength );
                    $("#calc_total_length").val(fromOrigToDestLength);

                    if( totalLength*1 > 1200000 ) {
                        $("#orderFormContainer button").removeClass("loading");
                        $(".orderStep2 .row").append('<div id="longRouteNotify" class="cell full notify warning">\
                            <span>The route is over 1200 km. Please call us on \
                            <a href="tel:+19025931464">+1 902 593 14 64</a>&nbsp;and \
                            we will resolve this issue with you.</span>\
                        </div>');
                        return;
                    }

                    if( type == 3 || type == 5 || type == 9 || type == 15 ) {
                        if( totalLength*1 > 200000 ) {
                            var totalCost = $("#orderPriceLongLength").val() * (totalLength/1000).toFixed(2);
                            totalCost += $("#orderPriceBasePriceLongLength").val()*1;
                        } else {
                            var totalCost = $("#orderPriceShortLength").val() * (fromOrigToDestLength/1000).toFixed(2);
                            totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                        }

                        if( totalCost < $("#orderPriceMinPrice").val()*1 ) {
                            totalCost = $("#orderPriceMinPrice").val()*1;
                        }
                        $("#calc_base_amount").val(totalCost);

                        $("#orderFormContainer .duration").html( toHoursAndMin( response2.routes[0].legs[0].duration.value ) );

                        $("#orderSelectedDate").html( $("#date").val() );
                        $("#orderSelectedTime").html( $("#time").val() );

                        recalcOrder();
                    } else if( type == 4 || type == 17 ) {
                        var totalCost = 0;
                        if( totalLength*1 > 200000 ) {
                            var totalCost = $("#orderPriceLongLength").val() * (totalLength/(1000)).toFixed(2);
                            totalCost += $("#orderPriceBasePriceLongLength").val()*1;
                        } else {
                            var totalCost = $("#orderPriceShortLength").val() * (fromOrigToDestLength/(1000)).toFixed(2);
                            totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                        }
                        $("#orderFormContainer .duration").html( toHoursAndMin( response2.routes[0].legs[0].duration.value ) );

                        if( totalCost < $("#orderPriceMinPrice").val()*1 ) {
                            totalCost = $("#orderPriceMinPrice").val()*1;
                        }
                        $("#calc_base_amount").val(totalCost);
                        $("#orderSelectedDate").html( $("#date").val() );
                        $("#orderSelectedTime").html( $("#time").val() );

                        recalcOrder();
                    } else if( type == 8 ) {//medical
                        var totalCost = 0;

                        if( $("#one_way").is(":checked") ) {//Wait and take back CHECKED
                            var duration = response2.routes[0].legs[0].duration.value;
                            if( totalLength > 200000 ) {
                                totalCost = ( totalLength / 1000 ) * $("#orderPriceLongLength").val() + 3 * $("#orderPricePerHour").val();
                                totalCost += $("#orderPriceBasePriceLongLength").val()*1;
                            } else {
                                totalCost = ( fromOrigToDestLength / 1000 ) * $("#orderPriceShortLength").val() + 3 * $("#orderPricePerHour").val();
                                totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                            }
                            $("#orderFormContainer .duration").html( toHoursAndMin( duration*1 + 3 ) );
                        } else {
                            if( totalLength > 200000 ) {
                                totalCost = $("#orderPriceLongLength").val() * (totalLength/1000).toFixed(2);
                                totalCost += $("#orderPriceBasePriceLongLength").val()*1;
                            } else {
                                totalCost = $("#orderPriceShortLength").val() * (fromOrigToDestLength/1000).toFixed(2);
                                totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                            }
                            $("#orderFormContainer .duration").html( toHoursAndMin( response2.routes[0].legs[0].duration.value ) );
                        }
                        if( totalCost < $("#orderPriceMinPrice").val()*1 ) {
                            totalCost = $("#orderPriceMinPrice").val()*1;
                        }
                        $("#calc_base_amount").val(totalCost);
                        $("#orderSelectedDate").html( $("#date").val() );
                        $("#orderSelectedTime").html( $("#time").val() );

                        recalcOrder();
                    } else if( type == 6 ) {//airport
                        var totalCost = 0;
                        if( $("#one_way").is(":checked") ) {//"Meet me on the way back" CHECKED
                            totalCost = ( ( totalLength + fromOrigToDestLength*3 ) / 1000 ) * $("#orderPrice6").val();
                            totalCost += $("#orderPriceBasePriceShortLength").val()*1;                                
                            $("#orderFormContainer .duration").html( toHoursAndMin( response2.routes[0].legs[0].duration.value*4 ) );
                        } else {
                            totalCost = ( ( totalLength + fromOrigToDestLength ) / 1000 ) * $("#orderPrice6").val();
                            totalCost += $("#orderPriceBasePriceShortLength").val()*1;
                            $("#orderFormContainer .duration").html( toHoursAndMin( response2.routes[0].legs[0].duration.value*2 ) );
                        }

                        if( totalCost < $("#orderPriceMinPrice").val()*1 ) {
                            totalCost = $("#orderPriceMinPrice").val()*1;
                        }
                        $("#calc_base_amount").val(totalCost);

                        $("#orderSelectedDate").html( $("#date").val() );
                        $("#orderSelectedTime").html( $("#time").val() );

                        recalcOrder();
                    }

                    $("#orderFormContainer button").removeClass("loading");

                    if( $(".orderStep2 .result .makeOrder").length == 0 ) {
                        $(".orderStep2 .result").append('<a class="makeOrder" href="#">Make an order</a>');
                    }
                } else {
                    $("#orderFormContainer button").removeClass("loading");
                    window.alert("Directions request failed due to " + status);
                    return;
                }
            });
        } else {
            $("#orderFormContainer button").removeClass("loading");
            window.alert("Directions request failed due to " + status);
            return;
        }
        $("#orderFormContainer button").removeClass("loading");
    });
}
function initTimeSuggest( timeElem, dateElem ) {
    var year = $('#currYear').val(), month = $('#currMonth').val(),day = $('#currDay').val(),
    nextDayYear = $('#nextDayYear').val(), nextDayMonth = $('#nextDayMonth').val(),nextDayDay = $('#nextDayDay').val(),
    hour = $('#currHour').val(), minute = $('#currMinute').val(), maxHour = hour*1, maxMinute = 0,
    availTimes = [], timeSuggestContent = '', innerHour, interval;

    maxMinute = minute*1 + 30

    if( maxMinute >= 60 ) {
        maxMinute = maxMinute - 60;
        maxHour = maxHour + 1;
    }
    if( maxMinute <= 15 && maxMinute > 0 ) {
        maxMinute = 15;
    } else if( maxMinute <= 30 && maxMinute > 0 ) {
        maxMinute = 30;
    } else if( maxMinute <= 45 && maxMinute > 0 ) {
        maxMinute = 45;
    } else {
        maxMinute = 0;
        maxHour = maxHour + 1;
    }

    if( dateElem.val() == year + "-" + month + "-" + day ) {//if today
        if( maxHour < 9 ) {
            maxMinute = 0;
        }
        //Orders can be placed no earlier than 10am today
        maxHour = Math.max( maxHour, 10 );
        for( var i = maxHour; i < 24; i++ ) {
            innerHour = i;
            interval = 'a.m.';
            if( i >= 12 ) interval = 'p.m.';
            if( i >= 13 ) innerHour = i-12;
            if( innerHour < 10 ) innerHour = '0'+innerHour;

            if( i == maxHour ) {
                if( maxMinute < 15 ) {
                    availTimes.push( [innerHour, '00', interval, i] );
                }
                if( maxMinute < 30 ) {
                    availTimes.push( [innerHour, '15', interval, i] );
                }
                if( maxMinute < 45 ) {
                    availTimes.push( [innerHour, '30', interval, i] );
                }
                if( maxMinute == 45 ) {
                    availTimes.push( [innerHour, '45', interval, i] );
                }
            } else {
                availTimes.push( 
                    [innerHour, '00', interval, i], 
                    [innerHour, '15', interval, i], 
                    [innerHour, '30', interval, i], 
                    [innerHour, '45', interval, i] 
                );
            }
        }
    } else if( dateElem.val() == nextDayYear + "-" + nextDayMonth + "-" + nextDayDay ) {//if tomorrow
        if( hour*1 == 23 && minute*1 >= 30 ) {
            maxHour = 10;
        } else {
            availTimes.push( ['05', '30', 'a.m.', 5] );
            availTimes.push( ['05', '45', 'a.m.', 5] );
            maxHour = 6;
        }
        for( var i = maxHour; i < 24; i++ ) {
            innerHour = i;
            interval = 'a.m.';
            if( i < 10 ) innerHour = '0'+i;
            if( i >= 12 ) interval = 'p.m.';
            if( i >= 13 ) innerHour = i-12;

            availTimes.push( 
                [innerHour, '00', interval, i], 
                [innerHour, '15', interval, i], 
                [innerHour, '30', interval, i], 
                [innerHour, '45', interval, i] 
            );
        }
    } else {
        availTimes.push( ['05', '30', 'a.m.', 5] );
        availTimes.push( ['05', '45', 'a.m.', 5] );
        for( var i = 6; i < 24; i++ ) {
            innerHour = i;
            interval = 'a.m.'
            if( i < 10 ) innerHour = '0'+i;
            if( i >= 12 ) interval = 'p.m.';
            if( i >= 13 ) innerHour = i-12;

            availTimes.push( 
                [innerHour, '00', interval, i], 
                [innerHour, '15', interval, i], 
                [innerHour, '30', interval, i], 
                [innerHour, '45', interval, i] 
            );
        }
    }

    if( availTimes.length > 0 ) {
        let currTimeStamp, disabledTimes = [], show = 1;

        for(var i = 0; i < availTimes.length; i++) {
            show = 1;
            if( availTimes[i][3] < 10 ) {
                currTimeStamp = new Date( dateElem.val() + 'T0' + availTimes[i][3]+':'+availTimes[i][1]+':00' );
            } else {
                currTimeStamp = new Date( dateElem.val() + 'T' + availTimes[i][3]+':'+availTimes[i][1]+':00' );
            }

            //console.log( dateElem.val() + " " + availTimes[i][3]+':'+availTimes[i][1] );
            $(".disabledTime").each(function() {
                if( dateElem.val() + " " + availTimes[i][3]+':'+availTimes[i][1] == $(this).val() ) {
                    show = 0;
                }
            })

            if( show == 1 ) {
                timeSuggestContent += '<option class="timeSuggestItem" data-hour="'+availTimes[i][3]+'" data-value="'+availTimes[i][0]+':'+availTimes[i][1]+'">'+availTimes[i][0]+':'+availTimes[i][1]+' ' + availTimes[i][2] + '</option>';
            }
        }
        timeElem.html( timeSuggestContent );
    } else {
        var nextDay = new Date( dateElem.val() );
		nextDay.setDate(nextDay.getDate() + 1);
        dateElem.datepicker("option","minDate", nextDay);
        initTimeSuggest( timeElem, dateElem );
    }
}
function initDatepicker() {
    if( $(".datepicker").length > 0 ) {
        $(".datepicker").datepicker({
            dateFormat: "yy-mm-dd",
            minDate: new Date()
        });
        $(".datepicker").each( function() {
            if( $(this).attr('id') == 'date' ) {
                initTimeSuggest( $("#time"), $(this) );
            }
            if( $(this).attr('id') == 'date2' ) {
                initTimeSuggest( $("#time2"), $(this) );
            }
        })
        $(".datepicker").datepicker('option','onClose', function() {
            if( $(this).val() == '' ) {
                $(this).parent().removeClass("focused");
            }
            if( $(this).attr('id') == 'date' ) {
                initTimeSuggest( $("#time"), $(this) );
            }
            if( $(this).attr('id') == 'date2' ) {
                initTimeSuggest( $("#time2"), $(this) );
            }
        });
    }
}
function initInputFocus() {
    $("input,textarea").each(function() {
        if( $(this).val() != '' ) {
            $(this).parent().addClass("focused");
        }
    })
    $("body").on("focus", "input, textarea", function() {
        if( !$(this).parent().hasClass("focused") ) {
            $(this).parent().addClass("focused");
        }
    }).on("blur", "input, textarea", function() {
        if( $(this).parent().hasClass("focused") && $(this).val() == '' && !$(this).hasClass("datepicker") ) {
            $(this).parent().removeClass("focused");
        }
    })
}
function recalcOrder() {
    let totalBaseCost = $("#calc_base_amount").val(), totalCost = totalBaseCost, 
        taxValue = 0.15, currVal = 0;
    if( $("#tip").length ) {
        totalCost = totalBaseCost * $("#tip").val();
    }
    totalCost = totalCost.toFixed(2);

    if( $("#calc_promo_discount").val()*1 > 0 ) {
        $(".item.promocode label.error").remove();

        if( $("#calc_promo_max_dist").val()*1 > 0 && $("#calc_promo_max_dist").val()*1 < $("#calc_total_length").val()/1000 ) {
            $(".item.promocode").append('<label id="promocode-error" class="error" for="promocode">\
                '+$("#error_trip_max_length").val().replace('%%%', $("#calc_promo_max_dist").val())+
                '</label>'
            );
            $(".discountContainer").hide();
            $("#calc_promo_is_error").val(1);
        } else {
            let selectedDay = $("#currYear").val() + "-" + $("#currMonth").val() + "-" + $("#currDay").val();
            if( $("#calc_promo_next_day_only").val() != 0 && $("#date").val() == selectedDay ) {
                $(".item.promocode").append('<label id="promocode-error" class="error" for="promocode">'+$("#error_next_day_only").val()+'</label>');
                $(".discountContainer").hide();
                $("#calc_promo_is_error").val(1);
            } else {
                if( $("#calc_promo_work_time_only").val()*1 > 0 && ( $("#time option:selected").attr('data-hour') < 9 || $("#time option:selected").attr('data-hour') >= 18 ) ) {
                    $(".item.promocode").append('<label id="promocode-error" class="error" for="promocode">'+$("#error_work_time_only").val()+'</label>');
                    $(".discountContainer").hide();
                    $("#calc_promo_is_error").val(1);
                } else {
                    $("#calc_promo_discount_val").val( ( totalCost * $("#calc_promo_discount").val()/100 ).toFixed(2) );
                    totalCost = ( totalCost - $("#calc_promo_discount_val").val() ).toFixed(2);
                    
                    $(".item.promocode").append('<label id="promocode-error" class="error promocodeValue" for="promocode">-' + $("#calc_promo_discount_val").val() + '$</label>');

                    $("#promoCodeDiscountInfo").html( ( $("#calc_promo_discount_val").val() ) + "$" );
                    $(".discountContainer").show();
                    $("#calc_promo_is_error").val(0);
                }
            }
        }
    } else {
        $(".discountContainer").hide();
    }

    //BOTTOM PAY BUTTON
    currVal = totalCost*1 + totalCost * taxValue;
    //console.log( totalCost );
    $("#step3PayButton button span").html( '$'+ currVal.toFixed(2) );
    //TOP CALC RESULT
    $("#orderFormContainer .summ").html( '$' + currVal.toFixed(2) );
    //BOTTOM RIGHT RESULT STRING
    $("#orderTotalCost").html( '$' + totalCost + " + $" + (totalCost * taxValue).toFixed(2) + " TAX"  );
    //HIDDEN FIELD
    $("#calc_amount").val( ( totalCost*1 ).toFixed(2) );
}
function getTimezoneOffset(timeZone) {
    const now = new Date();
    const tzString = now.toLocaleString('en-US', { timeZone });
    const localString = now.toLocaleString('en-US');
    const diff = (Date.parse(localString) - Date.parse(tzString)) / 3600000;
    const offset = diff + now.getTimezoneOffset() / 60;
    
    return -offset;
}