function addNewTitle(container, id, title) {
    $(container).append('<div class="row"><div class="col-lg-12"><h1 class="page-header section-title" id="'+ id +'"">'+ title +'</h1></div></div>');
}

function addNewPanel(container, id, panelTitle) {
    var panelBody = '<div class="row"><div class="col-lg-12"><div class="panel panel-default"><div class="panel-heading"><i class="fa fa-bar-chart-o fa-fw"></i> '+ panelTitle +'</div><div class="panel-body" id="'+ id +'"></div></div></div></div>';
    $(container).append(panelBody);
}

function addNewErrorPanel(container, id, panelTitle, errorMessage) {
    var panelBody = '<div class="row" id="'+ id +'"><div class="col-lg-12"><div class="panel panel-red"><div class="panel-heading"><i class="fa fa-bar-chart-o fa-fw"></i> '+ panelTitle +'</div><div class="panel-body">'+ errorMessage +'</div></div></div></div>';
    $(container).append(panelBody);
}

function removeErrorPanels() {
    $('#error').remove();
}

function changePanelTitle(id, newTitle) {
    $('#' + id).fadeOut('fast', function() {
        $(this).html(newTitle);
        $(this).fadeIn('fast');
    });
}

function showComponent(id) {
    $('#' + id).removeClass('hide');
}

function hideComponent(id) {
    $('#' + id).addClass('hide');
}

function formatDate(date) {
    return '14021412';
}
