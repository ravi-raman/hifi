/* Taken from :
	filedrag.js - HTML5 File Drag & Drop demonstration
	Featured on SitePoint.com
	Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
*/
function TraceLoader(handler) {
	this.self = this;
	this.handler = handler;

	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}


	// output information
	function Output(msg) {
		var m = $id("messages");
		m.innerHTML = msg + m.innerHTML;
	}


	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}

	// file selection
	function FileSelectHandler(e) {
		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}
	}

	function FileURLHandler(e) {
		var fileurl = $id("fileurl")
		Output( fileurl.value )
	}

	// output file information
	function ParseFile(file) {

		Output(
			"<p>File information: <strong>" + file.name +
			"</strong> type: <strong>" + file.type +
			"</strong> size: <strong>" + file.size +
			"</strong> bytes</p>"
		);

		if (file.type.indexOf("application/x-gzip") == 0 || 
            file.type.indexOf("application/gzip") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				var zipped = new Uint8Array(e.target.result)
				var unzipped  = pako.inflate(zipped, { to: 'string' });
				
				var data = JSON.parse(unzipped)
			  	var trace = new Trace(data);
				self.handler(trace);	
			}
			reader.readAsArrayBuffer(file);
		} else {
			var reader = new FileReader();
			reader.onload = function(e) {
				var data = JSON.parse(e.target.result)
			  	var trace = new Trace(data);
				self.handler(trace);
			}
			reader.readAsText(file);
		}
	}


	// initialize
	function Init(handler) {

		var fileselect = $id("fileselect"),
			filedrag = $id("filedrag")
			//,fileurlgo = $id("fileurlgo")

		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// url refresh
		//fileurlgo.addEventListener("click", FileURLHandler, false);

		// is XHR2 available?
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";
		}

		self.handler = handler
	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init(this.handler);
	}
}
