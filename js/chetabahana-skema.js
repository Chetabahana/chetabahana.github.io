$(window).load(function() {draw.diagram();});
$('.theme').change(function() {draw.tChange();});
$('.download').click(function(ev) {draw.xmlData();});

var draw = {

  'sequence' : 'sequence/js/sequence-diagram-snap-min.js',
  'flowchart': 'flowchart/flowchart-latest.js',
  'railroad' : 'railroad/railroad-diagrams.js',
  'jsonfeed' : '/feed.json',

  diagram : function() {

    var diagram;
    var select = $(".theme").val();
    
    var type = (!draw.type)? 'sequence': draw.type;    
    if (select=='hand' && type!='flowchart') type='sequence';
    
    $('#type').text(type);
    $('#type')[0].href = '/' + type;
    $('.diagram').html(''); $("#loadingImg").show();

    var jsonfile = this['jsonfeed'] + '?t=' + $.now();
    var js = '/' + this[type];

    $.getScript(js, function( data, textStatus, jqxhr ) {    

       try {

         if(type == 'sequence') {

           if (select == 'hand') {

             var editor = ace.edit($('.editor').get(0));
             editor.setTheme("ace/theme/crimson_editor");
             editor.getSession().setMode("ace/mode/asciidoc");
             editor.getSession().on('change', _.debounce(function() {draw.diagram();}, 100) );

             draw.skema = editor.getValue();
             diagram = Diagram.parse(draw.skema);

             draw.opt = {theme: select, "font-size": 12};
             diagram.drawSVG($('.diagram').get(0), draw.opt);

           } else {

             $.getJSON(jsonfile).done(function(result){

               var obj = result.items[4].items[0];

               draw.skema = draw.encode(obj.query);
               diagram = Diagram.parse(draw.skema);

               draw.opt = {theme: select, "font-size": 13};
               diagram.drawSVG($('.diagram').get(0), draw.opt);

             });
 
           }


         } else if(type == 'flowchart'){

           $.getJSON(jsonfile, draw.opt).done(function(result){

              var a = Number((draw.point.substr(0,1)));
              var b = Number((draw.point.substr(1,1)));

              var obj = result.items[4].items[1];
              draw.skema = draw.encode(obj.query);

              diagram = flowchart.parse(draw.skema);
              diagram.drawSVG($('.diagram').get(0), obj.input);

            });

         } else if(type == 'railroad'){
         
            $.getJSON(jsonfile, draw.opt).done(function(result){

              var a = Number((draw.point.substr(0,1)));
              var b = Number((draw.point.substr(1,1)));
              var c = Number((draw.point.substr(2,1)));
              var d = Number((draw.point.substr(3,2)));

              var obj = result.items[4].items[2];
              draw.skema = draw.encode(obj.query);

              $('.contact_left').hide(); 
              diagram = eval(draw.skema).format();
              diagram.addTo($('.diagram').get(0));

            });

         }

       } finally {

          draw.type = type;
          draw.checkReady();

       }
    });  
  },

  checkReady : function() {

    if (!$('.diagram').find('svg')[0]) {
      window.requestAnimationFrame(draw.checkReady);

    } else {

      switch(draw.type) {

        case 'sequence':

          $('svg g.actor').each(function( index ) {
             this.id = '0' + Math.floor(index/2).toString();
          });
          $('svg g.signal').each(function( index ) {
             this.id = '1' + index.toString();
          });
          draw.elements = $('svg g.actor, svg g.signal');

        break;

        case 'flowchart':

          $(".theme").val("simple");
          $('svg .flowchart').each(function( index ) {
             this.id = draw.point + draw.pad('0' + index, 3);
          });
          $('svg text').each(function( index ) {
             this.id = draw.point + draw.pad('1' + index, 3);
          });
          draw.elements = $('svg .flowchart, svg text');

        break;

        case 'railroad':

          $('svg rect').each(function( index ) {
             this.id = draw.point + draw.pad('0' + index, 3);
          });
          $('svg text').each(function( index ) {
             this.id = draw.point + draw.pad('1' + index, 4);
          });
          draw.elements = $('svg rect, svg text');

        break;

      }

      $('#loadingImg').hide();

      draw.elements.css('cursor','pointer')
        .hover(function() {

          $(this).hide(100).show(100);

      }).click(function() {

          if (draw.type != 'railroad') {

            draw.type = (draw.type == 'sequence')? 
              'flowchart': 'railroad';

          } else {

            var a = Number((this.id.substr(0,1)));
            var b = Number((this.id.substr(1,1)));
            var c = Number((this.id.substr(2,1)));
            var d = Number((this.id.substr(3,2)));
            var e = Number((this.id.substr(5,1)));
            var f = Number((this.id.substr(6,3)));

            $('.contact_left').show();
            draw.type = 'sequence';

          }

          draw.point = this.id;
          draw.diagram();

      });

    } 
  },

  xmlData : function() {
    var a = $(this);
    var svg = $(".diagram").find('svg')[0];
    var width = parseInt(svg.width.baseVal.value);
    var height = parseInt(svg.height.baseVal.value);
    var xmldata = '<?xml version="1.0" encoding="utf-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" xmlns:xlink="http://www.w3.org/1999/xlink"><source><![CDATA[' + draw.skema + ']]></source>' + svg.innerHTML + '</svg>';
    a.attr("download", "diagram.svg"); 
    var xml = encodeURIComponent(xmldata);
    a.attr("href", "data:image/svg+xml," + xml);
  },  

  encode : function(data) {  
    return data.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&')
               .replace(/<p>/g, '')
               .replace(/<\/p>/g, '')
               .replace(/‘/g, "'")
               .replace(/’/g, "'")
    ;
  }, 

  tChange : function() {
    var regex = /[?&]([^=#]+)=([^&#]*)/g, url = window.location.href, params = {}, match;
    while(match = regex.exec(url)) {params[match[1]] = match[2];}
    draw.params = params; console.log(draw.params);

    var select = $('.theme').val();
    draw.type = (select == 'hand')? 'sequence': draw.type;
    if (draw.type != 'railroad') $('.contact_left').show();
    draw.diagram();
  },

  pad : function(data, size) {
    var s = String(data);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

}
