"use strict";function _interopDefault(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var rollupPluginutils=require("rollup-pluginutils"),matched=_interopDefault(require("matched")),name="entry-glob",entry="\0rollup-plugin-entry-glob:single-entry",suppressed="\0rollup-plugin-entry-glob:suppressed",sortArray=function(e){var n=["js","mjs","jsx","es","es6","ts","tsx","json"].reverse(),r=["html","htm","php","css","scss","sass","less","png","jpg","jpeg","gif","svg"];return e.sort(function(e,t){var s=e.split(".").pop(),u=t.split(".").pop();return-n.indexOf(s)+r.indexOf(s)-(-n.indexOf(u)+r.indexOf(u))})};function entryGlob(e){var n=e.fileName?"\0"+e.fileName:entry,r=e.include||e.exclude?rollupPluginutils.createFilter(e.include,e.exclude):rollupPluginutils.createFilter("**/*"),t=[],s=[],u=function(e){return"export * from "+JSON.stringify(e)+";"},l=function(e){return"import "+JSON.stringify(e)+";"};return e.exports=void 0===e.exports||!0===e.exports,{name:name,options:function(e){var u=[n,suppressed],l={};if(e.manualChunks)for(var i=function(){var e=p[o],n=e[0],r=e[1];l[n]=[],matched.sync(r,{realpath:!0}).forEach(function(e){l[n].push(e),s.push(e)})},o=0,p=Object.entries(e.manualChunks);o<p.length;o+=1)i();e.input&&e.input!==n&&matched.sync(e.input,{realpath:!0}).forEach(function(e){s.includes(e)||(r(e)&&t.push(e),u.push(e))}),e.manualChunks=l,e.input=sortArray(u)},resolveId:function(e){return e===n?n:e===suppressed?suppressed:null},load:async function(r){return r===n?t.length?Promise.resolve(e.exports?t.map(u).join("\n"):t.map(l).join("\n")):Promise.resolve(""):r===suppressed?s.length?Promise.resolve(s.map(u).join("\n")):Promise.resolve(""):void 0},generateBundle:async function(e,r){var s=n.replace("\0","_")+".js";r[s].fileName=n.replace("\0","")+".js",t.length||delete r[s],delete r[suppressed.replace("\0","_")+".js"];for(var u=0,l=Object.entries(r);u<l.length;u+=1){var i=l[u],o=i[0],p=i[1];t.includes(p.facadeModuleId)&&("\n"===p.code||"\r\n"===p.code)&&p.isEntry&&delete r[o]}}}}module.exports=entryGlob;
//# sourceMappingURL=index.js.map
