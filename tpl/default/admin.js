$(document).ready(function() {

  var opts = {
    basePath: '//cdnjs.cloudflare.com/ajax/libs/epiceditor/0.2.0/',
    autogrow: true
  }
  var editor = new EpicEditor(opts).load();

  $("#page").click(function(){
    if($("#page").val() == "-"){
      return;
    }
    getFile(editor, "pages", $("#page").val());
  });

  $("#comments").click(function(){
    getFile(editor, "comments", $("#comments").val());
  });

  $("#options").click(function(){
    getFile(editor, "pages/conf", $("#options").val());
  });

  $("#storage").click(function(){
    getStorage(editor);
  });

  $("#newPage").click(function(){
    var namespace = $("#namespace").val();
    var pname = prompt('Page name?', $("#NewPage.md").val());
    if(pname){
      $.post('./_/newPage', {ns : namespace, name : pname}, function(data) {
          listPages();
          listOptions();
          // Open the new file
          getFile(editor, "pages", data);
        }).error(function(data) {
          alert(data.responseText);
        });
    }
  });

  $("#renamePage").click(function(){
    var target = $("#namespace").val()+"/pages/"+$("#page").val();
    var newName = prompt('New name ?', $("#page").val());
    if(newName){
      $.post('./_/rename', {name : newName, file : target}, function(data) {
          alert(data);
          listPages();
          listOptions();
          listComments();
        }).error(function(data) {
          alert(data.responseText);
        });
    }
  });

  $("#deletePage").click(function(){
    var target = $("#namespace").val()+"/pages/"+$("#page").val();
    if (confirm('Delete '+target+' ?')) {
      $.post('./_/remove', {type : "page", file : target}, function(data) {
        alert(data);
        listPages();
        listOptions();
        listComments();
      }).error(function(data) {
        alert(data.responseText);
      });
    }
  });

  $("#deleteFile").click(function(){
    var target = $("#namespace").val()+"/files/"+$("#file").val();
    if (confirm('Delete '+target+' ?')) {
      $.post('./_/remove', {type : "file", file : target}, function(data) {
        alert(data);
        listFiles();
      }).error(function(data) {
        alert(data.responseText);
      });
    }
  });

  $("#namespace").click(function(){
    var target = $("#namespace").val();
    if(target ==  "default"){
      document.location = "/_admin";
    } else {
      document.location = "/" + target + "/_admin";
    }
  });

  $("#save").click(function() {
    $("#saved").text("");
    $("#saved").css("color", "black");
    var theContent = editor.exportFile();
    $.post('./_/save', {
        page: $("#curFile").text(),
        content : editor.exportFile(),
        tags : $("#tags").val(),
        ns : $("#namespace").val()
      }
      , function(data) {
      $("#saved").text(data);
    }).error(function(data) {
      $("#saved").css("color", "red");
      $("#saved").text(data.responseText);
    });
  });

  $("#openFile").click(function(){
    window.open(
      'files/' + $("#file").val(),
      'file'
    );
  });

  $("#refreshTags").click(function(){
    $.post('./_/refreshTags',{}).error(function(data) {
      alert(data.responseText);
    });
  });

  listPages();
  listOptions();
  listFiles();
  listComments();
  listStorages(editor);

  // Keep session alive as long as admin page is open
  setInterval('keepAlive();', '1500000'); // Every 25mn
});

function keepAlive(){
  $.get('./_/keepAlive');
}

function listPages(){
  $.post('./_/nsPages', {} ,
    function( data ) {
      $("#page").empty();
      $("#page").append("<option value='-'>-- Page --</option>");
      $.each(data, function(i, d){
        $("#page").append("<option value="+d+">"+d+"</option>");
      });
    }
  ).error(function(data) { alert(data.responseText); })
}

function listStorages(editor){
    $("#storage").empty();
    $("#storage").append("<option value='-'>-- Local Storage --</option>");
    var data = editor.getFiles();
    $.each(data, function(k, v){
      if(typeof k == 'string'){
        $("#storage").append("<option value="+k+">"+k+"</option>");
      }
    });
}

function listOptions(editor){
  $.post('./_/nsOptions', {} ,
    function( data ) {
      $("#options").empty();
      $("#options").append("<option value='-'>-- Options --</option>");
      $.each(data, function(i, o){
        $("#options").append("<option value="+o+">"+o+"</option>");
      });
    }
  ).error(function(data) { alert(data.responseText); })
}

// Fetch a file and load it up in the editor
function getFile(editor, folder, file){
  var path = $("#namespace").val()+ "/"+folder+"/" + file;
  $.post('./_/pageText', { page : path} ,
    function( data ) {
      $("#curFile").text(path);
      editor.importFile(file, data);
    }
  ).error(function(data) { alert(data.responseText);console.debug(data); })
  $.post('./_/pageTags', {
    ns : $("#namespace").val(),
    page : file
    } ,
    function( data ) {
      console.log(data);
      $("#tags").val(data);
    }
  ).error(function(data) { alert(data.responseText);console.debug(data); })
}

function getStorage(editor){
  var file = $("#storage").val();
  $("#curFile").text(file);
  editor.importFile(file, editor.getFiles(file).content);
}

function listFiles(){
  $.post('./_/nsFiles', {},
    function( data ) {
      $("#file").empty();
      $("#file").append("<option value='-'>-- File --</option>");
      $.each(data, function(i, f){
        $("#file").append("<option value="+f+">"+f+"</option>");
      });
    }
  ).error(function(data) { alert(data.responseText); })
}

function listComments(){
  $.post('./_/nsComments', {} ,
    function( data ) {
      $("#comments").empty();
      $("#comments").append("<option value='-'>-- Comment --</option>");
      $.each(data, function(i, d){
        $("#comments").append("<option value="+d+">"+d+"</option>");
      });
    }
  ).error(function(data) { alert(data.responseText); })
}

