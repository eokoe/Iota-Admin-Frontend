var zoom_padrao = 5;
var map;
var boxText;
var myOptions;
var ib;
var cidade_data;
var indicadores_data;
var graficos = [];
var infoVars = [];
infoVars["_prefeitura"] = [
				{"cognomen": "prefeito", "type": "text"},
				{"cognomen": "vice-prefeito", "type": "text"},
				{"cognomen": "pop_total", "type": "number", "format": "#,###"},
				{"cognomen": "pop_rural", "type": "number", "format": "#,###"},
				{"cognomen": "pop_urbana", "type": "number", "format": "#,###"},
				{"cognomen": "pop_mul_20a59_anos", "type": "number", "format": "#,###"},
				{"cognomen": "pop_masc_15a29_anos", "type": "number", "format": "#,###"},
				{"cognomen": "area_municipio", "type": "number", "format": "#,###"},
				{"cognomen": "densidade_demo", "type": "number", "format": "#,##0.###"},
				{"cognomen": "expect_vida", "type": "number", "format": "#,###"},
				{"cognomen": "idh_municipal", "type": "number", "format": "#,###"},
				{"cognomen": "gini", "type": "number", "format": "#,###"},
				{"cognomen": "pib", "type": "number", "format": "#,###"},
				{"cognomen": "renda_capita", "type": "number", "format": "#,##0.##"},
				{"cognomen": "part_eleitorado", "type": "number", "format": "#,##0.##"},
				{"cognomen": "website", "type": "text"}
];
infoVars["_movimento"] = [
				{"cognomen": "pop_total", "type": "number", "format": "#,###"},
				{"cognomen": "pop_rural", "type": "number", "format": "#,###"},
				{"cognomen": "pop_urbana", "type": "number", "format": "#,###"},
				{"cognomen": "pop_mul_20a59_anos", "type": "number", "format": "#,###"},
				{"cognomen": "pop_masc_15a29_anos", "type": "number", "format": "#,###"},
				{"cognomen": "area_municipio", "type": "number", "format": "#,###"},
				{"cognomen": "densidade_demo", "type": "number", "format": "#,##0.###"},
				{"cognomen": "expect_vida", "type": "number", "format": "#,###"},
				{"cognomen": "idh_municipal", "type": "number", "format": "#,###"},
				{"cognomen": "gini", "type": "number", "format": "#,###"},
				{"cognomen": "pib", "type": "number", "format": "#,###"},
				{"cognomen": "renda_capita", "type": "number", "format": "#,##0.##"},
				{"cognomen": "part_eleitorado", "type": "number", "format": "#,##0.##"},
				{"cognomen": "website", "type": "text"}
];

$(document).ready(function(){

	function loadCidadeData(){
		loadMap();
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: api_path + '/api/public/user/$$id'.render({
							id: userID
					}),
			success: function(data, textStatus, jqXHR){
				cidade_data = data;
				showCidadeData();
				loadIndicadoresData();
			},
			error: function(data){
				console.log("erro ao carregar informações da cidade");
			}
		});
	}

	function loadMap(){
		
		var mapDefaultLocation = new google.maps.LatLng(-14.2350040, -51.9252800);
		var geocoder = new google.maps.Geocoder();
	
		var mapOptions = {
				center: mapDefaultLocation,
				zoom: zoom_padrao,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
	
		map = new google.maps.Map(document.getElementById("mapa"),mapOptions);
		
		boxText = document.createElement("div");
		boxText.style.cssText = "border: 2px solid #20c1c1; margin-top: 8px; background: white; padding: 0px;";
		boxText.innerHTML = "";
		myOptions = {
			 content: boxText
			,disableAutoPan: false
			,maxWidth: 0
			,pixelOffset: new google.maps.Size(-100, 0)
			,zIndex: null
			,boxStyle: { 
			  background: "url('/static/images/tipbox.gif') no-repeat"
			  ,opacity: 0.90
			  ,width: "200px"
			 }
			,closeBoxMargin: "10px 2px -13px 2px"
			,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
			,infoBoxClearance: new google.maps.Size(1, 1)
			,isHidden: false
			,pane: "floatPane"
			,enableEventPropagation: false
		};
	
		ib = new InfoBox(myOptions);
		
		ib.close();

	}
		
	function setMap(lat,lng){
		var center = new google.maps.LatLng(lat, lng)
		map.setCenter(center);

		var image = new google.maps.MarkerImage("/static/images/pin.png");
		
		var marker = new google.maps.Marker({
			position: center,
			map: map,
			icon: image,
			draggable: false
		});
		
		marker.__position = center;
		
		google.maps.event.addListener(marker, 'click', function(e) {
			map.setCenter(marker.__position);
			if (map.getZoom() < zoom_padrao) map.setZoom(zoom_padrao);
			showInfoWindow(marker,"marker");
		});


	}
	
	function showInfoWindow(marker,source){
		boxTextContent = "<table class='infowindow'><thead>";
		boxTextContent += "<tr>";
		boxTextContent += "<th>Prefeitura</th>";
		boxTextContent += "</tr></thead>";
		boxTextContent += "<tbody>";
		boxTextContent += "<tr>";
		if (cidade_data.cidade.endereco_prefeitura != null || cidade_data.cidade.telefone_prefeitura != null){
			boxTextContent += "<td>" + cidade_data.cidade.endereco_prefeitura + "<br />" + cidade_data.cidade.telefone_prefeitura + "</td>";
		}else{
			boxTextContent += "<td>Dados não informados</td>";
		}
		boxTextContent += "</tr>";
		boxTextContent += "</tbody></table>";

		boxText.innerHTML = boxTextContent;
		ib.close();
		ib.setContent(boxText);
		ib.open(map, marker);
	}


	
	function showCidadeData(){
		cidade_data.cidade.imagem = "saopaulo.jpg";
		loadBreadCrumb();
		$("#cidades-dados .profile .title").html(cidade_data.cidade.name + ", " + cidade_data.cidade.uf);
		if (cidade_data.cidade.summary){
			$("#cidades-dados .summary .content-fill").html(cidade_data.cidade.summary);
		}
		$("#cidades-dados .profile .variaveis .tabela").empty();
		$("#cidades-dados .profile .variaveis .tabela").append("<tr class='item'><td class='label'>Cidade:</td><td class='valor'>$$dado</td></tr>".render({dado: cidade_data.cidade.name}));
		$("#cidades-dados .profile .variaveis .tabela").append("<tr class='item'><td class='label'>Estado:</td><td class='valor'>$$dado</td></tr>".render({dado: cidade_data.cidade.uf}));
		$("#cidades-dados .profile .variaveis .tabela").append("<tr class='item'><td class='label'>País:</td><td class='valor'>$$dado</td></tr>".render({dado: paises[cidade_data.cidade.pais]}));
	
		$.each(infoVars[role],function(index,value){
			var dadoIndex = findInJson(cidade_data.variaveis, "cognomen", infoVars[role][index].cognomen);
			if (dadoIndex.found){
				var label = cidade_data.variaveis[dadoIndex.key].name;
				if (infoVars[role][index].type == "number"){
					var value = $.formatNumber(cidade_data.variaveis[dadoIndex.key].last_value, {format:infoVars[role][index].format, locale:"br"});
				}else if (infoVars[role][index].type == "text"){
					var value = cidade_data.variaveis[dadoIndex.key].last_value;
				}
				if (cidade_data.variaveis[dadoIndex.key].measurement_unit != null && cidade_data.variaveis[dadoIndex.key].measurement_unit != undefined && cidade_data.variaveis[dadoIndex.key].measurement_unit != ""){
					var measurement_unit = " <span class='measurement_unit'>" + cidade_data.variaveis[dadoIndex.key].measurement_unit + "</span>";
				}else{
					var measurement_unit = "";
				}
				if (cidade_data.variaveis[dadoIndex.key].last_value_date != null && cidade_data.variaveis[dadoIndex.key].last_value_date != undefined && cidade_data.variaveis[dadoIndex.key].last_value_date != ""){
					var last_date = "<span class='last_date'>(" + convertDateToPeriod(cidade_data.variaveis[dadoIndex.key].last_value_date,cidade_data.variaveis[dadoIndex.key].period) + ")</span>";
				}else{
					var last_date = "";
				}
				$("#cidades-dados .profile .variaveis .tabela").append("<tr class='item'><td class='label'>$$label:</td><td class='valor'>$$value$$measurement_unit $$last_date</td></tr>".render(
					{
						label: label,
						value: value,
						last_date: last_date,
						measurement_unit: measurement_unit
					}
				));
			}
		});
	
	/*	$.each(cidade_data.variaveis,function(index,value){
			$("#cidades-dados .profile .variaveis .tabela").append("<tr class='item'><td class='label'>$$label:</td><td class='valor'>$$value</td></tr>".render(
				{
					label: cidade_data.variaveis[index].name,
					value: $.formatNumber(cidade_data.variaveis[index].last_value, {format:"#,###", locale:"br"})
				}
			));
		});*/
	
		$("#cidades-dados .image").css("background-image","none");
		$("#cidades-dados .image").css("background-image","url('/static/images/"+cidade_data.cidade.imagem+"')");
		
		var diff = $("#cidades-dados .profile .content-fill").height() - $("#cidades-dados .profile").height() + 10;
		if (diff > 10){
			$("#cidades-dados .profile").css("height","+="+diff);
			$("#cidades-dados .resume").css("height","+="+diff);
			$("#cidades-dados .map").css("height","+="+diff);
			$("#cidades-dados #mapa").css("height","+="+diff);
		}
	
		setMap(cidade_data.cidade.latitude,cidade_data.cidade.longitude);
		
	}
	
	function loadIndicadoresData(){
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: api_path + '/api/public/user/$$id/indicator'.render({
							id: userID
					}),
			success: function(data, textStatus, jqXHR){
				indicadores_data = data;
				showIndicadoresData();
			},
			error: function(data){
				console.log("erro ao carregar indicadores da cidade");
			}
		});
	}
	
	function showIndicadoresData(){
		var table_content = ""
		$("#cidades-indicadores .table .content-fill").empty();
		table_content += "<table>";
		
		var cont = 0;
		
		$.each(indicadores_data.resumos, function(eixo_index, eixo){
			
			table_content += "<thead class='eixos'><tr><th colspan='20'>$$eixo</th></thead>".render({eixo: eixo_index});
	
			var periods = eixo;
			$.each(periods, function(period_index, period){
				var datas = periods[period_index].datas;
				
				if (datas.length > 0){
					table_content += "<thead class='datas'><tr><th></th>";
					$.each(datas, function(index, value){
						table_content += "<th>$$data</th>".render({data: (datas[index].nome) ? datas[index].nome : ""});
					});
					table_content += "<th></th></tr></thead>";
				}
	
				table_content += "<tbody>";
	
				var indicadores = periods[period_index].indicadores;
				$.each(indicadores, function(i,item){
					table_content += "<tr><td class='nome'><a href='$$url'>$$nome</a></td>".render({nome: item.name, url:  (window.location.href.slice(-1) == "/") ? item.name_url : window.location.href + "/" + item.name_url});
					if (item.valores.length > 0){
						for (j = 0; j < item.valores.length; j++){
							if (item.valores[j] == "-"){
								table_content += "<td class='valor'>-</td>";
							}else{
								table_content += "<td class='valor'>$$valor</td>".render({valor: $.formatNumber(item.valores[j], {format:"#,##0.###", locale:"br"})});
							}
						}
						table_content += "<td class='grafico'><a href='$$url'><canvas id='graph-$$id' width='40' height='20'></canvas></a></td>".render({id: cont, url:  (window.location.href.slice(-1) == "/") ? item.name_url : window.location.href + "/" + item.name_url});
	
						for (j = 0; j < item.valores.length; j++){
							if (item.valores[j] == "-"){
								item.valores[j] = 0;
							}
						}
						graficos[cont] = item.valores;
						cont++;
					}else{
						table_content += "<td class='valor' colspan='20'>-</td>";
					}
				});
				table_content += "</tbody>";
			});
		});
	
		table_content += "</table>";
		
		$("#cidades-indicadores .table .content-fill").append(table_content);
		
		geraGraficos();
	}
	
	function geraGraficos(){
		for (i = 0; i < graficos.length; i++){
			var line = new RGraph.Line('graph-'+i, graficos[i]);
			line.Set('chart.ylabels', false);
			line.Set('chart.noaxes', true);
			line.Set('chart.background.grid', false);
			line.Set('chart.hmargin', 0);
			line.Set('chart.gutter.left', 0);
			line.Set('chart.gutter.right', 0);
			line.Set('chart.gutter.top', 0);
			line.Set('chart.gutter.bottom', 0);
			line.Set('chart.colors', ['#b4b4b4']);
			line.Draw();
		}
	}

	if (ref == "cidade"){
		loadCidadeData();
	}

});
