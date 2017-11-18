$.getJSON('../data/3DModel.json', function(data) {
    config.dam3dModel = data;
});

initWaterLevel('water-level');
initSensorSchema('sensor-schema');

function selectTime(date, waterLevel, panelTitle) {
    if(config.selectedTime === undefined) {
        changePanelTitle('water-level-title', 'Water Level - ' + panelTitle);


        showComponent('water-level');
        showComponent('sensor-schema');
        $('#sensor-schema').removeClass('disabled');

    }
    else {
        changePanelTitle('water-level-title', 'Water Level - ' + panelTitle);
        $('#accelerograms').html('');
    }

    config.selectedTime = {
        date: date,
        panelTitle: panelTitle,
        waterLevel: waterLevel,
        formatedDate: formatDate(date)
    };
    //comment this line to fetch different sensor data
    //config.selectedTime.formatedDate = "14021412";
    $('#accelerograms-nav').click();
    console.log('requesting sensor data...');
    if(config.sensorData['14021412'] !== undefined) {
        console.log('skipped data request...');
        return;
    }


    $.getJSON('../data/14021412.json', function(_data) {
        config.sensorData['14021412'] = _data;
        console.log('data request finished');
    });
}

// ----------- Side Menu ON CLICK functions -----------
$('#water-level-nav').on('click', function() {
    if($('#water-level-nav a').hasClass('active'))
    return;

    $('#side-menu a').removeClass('active');
    $('#water-level-nav a').addClass('active');

    removeErrorPanels();
    showComponent('water-level-wrapper');
    hideComponent('accelerograms-wrapper');
    hideComponent('fdd-wrapper');
    hideComponent('threed-model-wrapper');
});

$('#accelerograms-nav').on('click', function() {
    // if($('#accelerograms-nav a').hasClass('active'))
    // return;

    $('#side-menu a').removeClass('active');
    $('#accelerograms-nav a').addClass('active');

    removeErrorPanels();
    showComponent('water-level-wrapper');
    showComponent('accelerograms-wrapper');
    hideComponent('fdd-wrapper');
    hideComponent('threed-model-wrapper');

    var hasErrors = false;

    if(config.selectedTime === undefined) {
        hideComponent('accelerograms-wrapper');
        addNewErrorPanel('#content', 'error', 'Error Getting Accelerograms', 'Error getting accelerograms data. You need to choose a date in the Water Level section.');
        hasErrors = true;
    }
    if(config.selectedSensors === undefined || config.selectedSensors.length === 0) {
        hideComponent('accelerograms-wrapper');
        addNewErrorPanel('#content', 'error', 'Error Getting Accelerograms', 'Error getting accelerograms data. You need to choose one or more sensors in the Water Level section.');
        hasErrors = true;
    }
    if(!hasErrors) {
        initAccelerograms('accelerograms');
    }
});

$('#fdd-nav').on('click', function() {
    // if($('#fdd-nav a').hasClass('active'))
    // return;

    $('#side-menu a').removeClass('active');
    $('#fdd-nav a').addClass('active');

    removeErrorPanels();
    hideComponent('water-level-wrapper');
    hideComponent('accelerograms-wrapper');
    showComponent('fdd-wrapper');
    hideComponent('threed-model-wrapper');

    if($('#load-fdd').length === 0) {
        $('#fdd-spectrum').html('');
        $('#fdd-displacement-list').html('');
        $('#fdd-displacement').html('');
        $('#fdd-displacement-3d').html('');
        $('#fdd').append('<button type="button" class="btn btn-primary btn-lg " id="load-fdd" data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i> Retrieving FDD-SV Data"></button>');

        var btn = $('#load-fdd').button('loading');

        if(config.selectedTime === undefined) {
            hideComponent('fdd-wrapper');
            addNewErrorPanel('#content', 'error', 'Error Getting FDD-SV', 'Error getting FDD-SV data. You need to choose a date in the Water Level section.');
            $('#load-fdd').remove();
        } else {
            changePanelTitle('fdd-title', 'FDD-SV - ' + config.selectedTime.panelTitle);
            initFDD('fdd');
        }
    }
});

$('#threed-model-nav').on('click', function() {
    $('#side-menu a').removeClass('active');
    $('#threed-model-nav a').addClass('active');

    removeErrorPanels();
    hideComponent('water-level-wrapper');
    hideComponent('accelerograms-wrapper');
    hideComponent('fdd-wrapper');
    showComponent('threed-model-wrapper');

    if($('#load-threed-model').length === 0) {
        $('#threed-fdd-spectrum').html('');
        $('#threed-model-calculated').html('');
        $('#threed-model-observed').html('');
        $('#threed-model-difference').html('');
        $('#threed-model').append('<button type="button" class="btn btn-primary btn-lg " id="load-threed-model" data-loading-text="<i class=\'fa fa-circle-o-notch fa-spin\'></i> Retrieving 3D Finite Element Model Data"></button>');

        var btn = $('#load-threed-model').button('loading');

        if(config.selectedTime === undefined) {
            hideComponent('threed-model-wrapper');
            addNewErrorPanel('#content', 'error', 'Error Getting 3D FE Model', 'Error getting 3D Finite Element data. You need to choose a date in the Water Level section.');
            $('#load-threed-model').remove();
        } else {
            changePanelTitle('threed-model-title', '3D Finite Element Model - ' + config.selectedTime.panelTitle);
            init3DFEModel('threed-model');
        }
    }
});
