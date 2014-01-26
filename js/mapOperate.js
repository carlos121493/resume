;(function(window){
	var MapOperate = function(container){
		this.map = MapOperate.createMap(container);
		//this.city = MapOperate.autoFocus(this.map);
		this.node = this.map.getContainer();
	}
	window.mapOperate = MapOperate;
	//自动填充并定位，获取this.location;
	MapOperate.prototype.auto = function(input_search){
		var mapObj = this.map;
		var that = this;
		var info_container = $(that.node).parent().find('.map_info');
		that.autoFocus(function(result){
			that.result = result;
			var ap = new qq.maps.place.Autocomplete(document.getElementById(input_search),{location:result.detail.name});
			var searchService = new qq.maps.SearchService({
				complete:function(results){
					if(results.detail.pois){
						var point = results.detail.pois[0];	
						if(that.searchMarker){
							that.searchMarker.setMap(null);
						}
						that.searchMarker = that.setMarker(point);
						MapOperate.setDrag(that.searchMarker);
						MapOperate.setAnim(that.searchMarker);
						that.zoom(point);
						if(info_container.hasClass('map_alert')){
							info_container.removeClass('map_alert').html('请拖拽图标以准确定位');
						}
					} else {
						info_container.addClass('map_alert').html('请输入准确的位置信息');
					}
				}
	   		 });
			searchService.setLocation(result.detail.name);
			qq.maps.event.addListener(ap, "confirm", function(res){
	       		 searchService.search(res.value);
	    	});
		});
	}
	//关键字定位
	MapOperate.prototype.search = function(value,region){
		var mapObj = this.map;
		var that = this;
		var searchService = new qq.maps.SearchService({
			complete:function(results){
				var point = results.detail.pois[0];
				that.setMarker(point);
				that.zoom(point);
			}
	   });
		if(region){
			searchService.setLocation(region);
		}
		searchService.search(value);
	}
	//多个坐标点适应
	MapOperate.prototype.fit = function(points){
		var latlngBounds = new qq.maps.LatLngBounds();
		for (var i = points.length - 1; i >= 0; i--) {
			latlngBounds.extend(points[i].latLng);  
		};
		this.map.fitBounds(latlngBounds);
	}
	//设置覆盖物
	MapOperate.prototype.setMarker = function(poi){
		var mapObj = this.map;
		var marker = new qq.maps.Marker({
            map:mapObj,
            position: poi.latLng
         });
		return marker;
	}
	//缩放
	MapOperate.prototype.zoom = function(poi){
		var mapObj = this.map;
		mapObj.panTo(poi.latLng);
		mapObj.zoomTo(20);
	}
	//自动根据本地判断
	MapOperate.prototype.autoFocus = function(callback){
		var result_map;
		var mapObj = this.map;
		citylocation = new qq.maps.CityService({
	      complete : function(result){
	          mapObj.setCenter(result.detail.latLng);
	          if(callback){
	          	callback(result);
	          }
	      }
	   });
	  	citylocation.searchLocalCity();
	}
    //生成地图
	MapOperate.createMap = function(container){
		var center = new qq.maps.LatLng(39.916527,116.397128);
		var that = this;
	  map = new qq.maps.Map(document.getElementById(container),{
	      center: center,
	      zoom: 13
	  });
	 
		return map;
	}
	MapOperate.setAnim = function(marker){
		marker.setAnimation(qq.maps.MarkerAnimation.DROP);
	}
	MapOperate.setDrag = function(marker){
		marker.setDraggable(true);
		qq.maps.event.addListener(marker,"dragstart",function(){
			marker.setAnimation(null);
       		console.log('ceshi');
		});
		qq.maps.event.addListener(marker,"dragging",function(){
       		
		});
		qq.maps.event.addListener(marker,"dragend",function(){
			marker.setAnimation(qq.maps.MarkerAnimation.BOUNCE);
			setTimeout(function(){
				marker.setAnimation(null);
			},200);
		});
	}
	MapOperate.coordToPoint = function(lat,lng){
		return qq.maps.LatLng(lat,lng);
	}
	MapOperate.pointToCoord = function(latlng){
		return latlng.getLat()+","+latlng.getLng();
	}
})(window)