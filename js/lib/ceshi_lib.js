(function(){
	//生成类
	var _Ceshi = window.Ceshi;
	
	Ceshi = function(){
		return Ceshi.fn.init();
	}
	Ceshi.fn = Ceshi.prototype = {
		init:function(){
			return this;
		}
	}
	
	Ceshi.fn.init.prototype = Ceshi.fn;
	//避免变量冲突
	Ceshi.fn.noConflict = function(){
		window.Ceshi = _Ceshi;
	}
	//将类形成规范
	if(typeof module==="object" && typeof module.exports === "object"){
		module.exports = Ceshi;
	} else {
		if(typeof define==="function" && define.amd){
			define('ceshi',[],function(){return Ceshi});
		}
	}
	if(typeof window==="object" && typeof window.document==="object"){
		window.Ceshi = Ceshi;
}
})(window);

