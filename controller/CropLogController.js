var recordIndexCropLogs;

function getCookies(cookieName) {
    let name = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

    function validateFields() {
        var log_code = $('#txtLogCodeCrop').val();
        var img = $('#txtLogImageCrop').prop('files')[0];
        var details = $('#txtCropDetails').val();
        var log_date = $('#txtLogDateCrop').val();

        var crop_code = $('#txtCropCodeLogs').val();
        var crop_name = $('#txtCropNameLogs').val();

        var isLogCodeValid = log_code.startsWith("CL") && /^\d+$/.test(log_code.substring(2));

        if (!isLogCodeValid || !img || details === "" || log_date === "" || crop_code === "" || crop_name === "") {
            if (!isLogCodeValid) {
                $('#txtLogCodeCrop').addClass('inValidData-input red').attr("placeholder", "Must start with CL followed by numbers");
                alert("Log Code must start with CL followed by numbers");
            }
            if (!img) {
                $('#txtLogImageCrop').addClass('inValidData-input red').attr("placeholder", "Log Image is required");
            }
            if (details === "") {
                $('#txtCropDetails').addClass('inValidData-input red').attr("placeholder", "Crop Details are required");
            }
            if (log_date === "") {
                $('#txtLogDateCrop').addClass('inValidData-input red').attr("placeholder", "Log Date is required");
            }
            if (crop_code === "") {
                $('#txtCropCodeLogs').addClass('inValidData-input red').attr("placeholder", "Crop Code is required");
            }
            if (crop_name === "") {
                $('#txtCropNameLogs').addClass('inValidData-input red').attr("placeholder", "Crop Name is required");
            }
        }
    }

$('#txtLogCodeCrop, #txtLogImageCrop, #txtCropDetails, #txtLogDateCrop, #txtCropCodeLogs, #txtCropNameLogs').on('input change', function () {
    $(this).removeClass('inValidData-input red');

    if ($(this).attr('id') === 'txtLogCodeCrop') {
        $('#txtLogCodeCrop').removeClass('inValidData-input red');
    } else if ($(this).attr('id') === 'txtLogImageCrop') {
        $('#txtLogImageCrop').removeClass('inValidData-input red');
    } else if ($(this).attr('id') === 'txtCropDetails') {
        $('#txtCropDetails').removeClass('inValidData-input red');
    } else if ($(this).attr('id') === 'txtLogDateCrop') {
        $('#txtLogDateCrop').removeClass('inValidData-input red');
    } else if ($(this).attr('id') === 'txtCropCodeLogs') {
        $('#txtCropCodeLogs').removeClass('inValidData-input red');
    } else if ($(this).attr('id') === 'txtCropNameLogs') {
        $('#txtCropNameLogs').removeClass('inValidData-input red');
    }
});


function clearFields() {
        $('#txtLogCodeCrop').val("CL").attr("placeholder","");
        $('#txtCropDetails').val("").attr("placeholder","");
        $('#txtLogDateCrop').val("").attr("placeholder","");
        $('#txtCropCodeLogs').val("").attr("placeholder","");
        $('#txtCropNameLogs').val("").attr("placeholder","");
        $('#txtLogImageCrop').val("").attr("placeholder","");
        $('#txtSearch-crop-logs').val("");
    }

    export function loadCropLogsTable() {
        $("#crop-logs-table-tb").empty();

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/logs',
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: function(logsResponse) {
                $('#log-total').text(logsResponse.length);
                $.ajax({
                    url: `http://localhost:8081/greenShadow/api/v1/cropLogs`,
                    type: 'GET',
                    dataType: 'json',
                    headers: {
                        'Authorization': `Bearer ${getCookies("token")}`,
                    },
                    success: function(cropResponse) {
                        console.log('details data',cropResponse);

                        const combinedData = populateData(logsResponse, cropResponse);
                        populateStaffTable(combinedData);
                    },
                    error: function(err) {
                        console.error(`Error loading field data for staff_id`, err);
                    }
                });
            },
            error: function(err) {
                console.error('Error loading logs data:', err);
            }
        });
    }

    function populateData(logsResponse, cropResponse) {
        // Create a map of staffResponse by staff_id for easy merging
        const logsMap = new Map(logsResponse.map(logs => [logs.log_code, logs]));

        // Iterate through fieldStaffResponse to add or update entries in the map
        cropResponse.forEach(cropLogs => {
            if (logsMap.has(cropLogs.log_code)) {
                // Merge additional fields into the existing staff entry
                Object.assign(logsMap.get(cropLogs.log_code), cropLogs);
            } else {
                // Add new field staff entry if it doesn't already exist
                logsMap.set(cropLogs.log_code, cropLogs);
            }
        });

        // Convert the map back to an array
        return Array.from(logsMap.values());
    }

    function populateStaffTable(data) {
        if (Array.isArray(data)) {
            data.forEach(function (cropLogsData) {
                if (cropLogsData.log_code.startsWith('CL')) {
                    const fieldLogRecord = `
                <tr>
                    <td class="cl-log_code">${cropLogsData.log_code}</td>
                    <td class="cl-crop_code">${cropLogsData.crop_code}</td>
                    <td class="cl-crop_name">${cropLogsData.crop_name}</td>
                    <td class="cl-details">${cropLogsData.details}</td>
                    <td class="cl-log_date">${cropLogsData.log_date}</td>
                    <td class="cl-img"><img src="data:image/png;base64,${cropLogsData.img}" width="150px"></td>
                </tr>`;
                    $('#crop-logs-table-tb').append(fieldLogRecord);
                }
            });
        }
    }

    $('#crop-logs-table-tb').on('click','tr',function () {
        recordIndexCropLogs = $(this).index();

        var log_code = $(this).find(".cl-log_code").text();
        var crop_code = $(this).find(".cl-crop_code").text();
        var crop_name = $(this).find(".cl-crop_name").text();
        var details = $(this).find(".cl-details").text();
        var log_date = $(this).find(".cl-log_date").text();

        $('#txtLogCodeCrop').val(log_code);
        $('#txtCropDetails').val(details);
        $('#txtLogDateCrop').val(log_date);
        $('#txtCropCodeLogs').val(crop_code);
        $('#txtCropNameLogs').val(crop_name);
    });

    $('#btnSearchCropsLogs').on('click', function() {
        const searchQuery = $('#txtSearchCropsLogs').val();
        searchCropsByID(searchQuery);
    });

    function searchCropsByID(query) {
        const crop_code = query.toLowerCase();

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/crop?crop_code=' + crop_code,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: (response) => {
                console.log('Full response:', response);
                for (let i = 0; i < response.length; i++) {
                    if (crop_code === response[i].crop_code) {
                        var crop = response[i];
                        break;
                    }
                }

                if (crop) {
                    $('#txtCropCodeLogs').val(crop.crop_code);
                    $('#txtCropNameLogs').val(crop.common_name);
                    $('#txtSearchCropsLogs').val("");
                } else {
                    console.error('Crop not found');
                }
            },
            error: function(error) {
                console.error('Error searching crop:', error);
            }
        });
    }

    $('#save-crop-logs').on('click', () => {
        var log_code = $('#txtLogCodeCrop').val();
        var img = $('#txtLogImageCrop').prop('files')[0];
        var details = $('#txtCropDetails').val();
        var log_date = $('#txtLogDateCrop').val();

        var crop_code = $('#txtCropCodeLogs').val();
        var crop_name = $('#txtCropNameLogs').val();

        var isLogCodeValid = log_code.startsWith("CL") && /^\d+$/.test(log_code.substring(2));
        if (!isLogCodeValid || !img || details === "" || log_date === "" || crop_code === "" || crop_name === "") {
            validateFields();
            return;
        }

        var logData = new FormData();
        logData.append('log_code', log_code);
        logData.append('img', img);
        logData.append('details', details);
        logData.append('log_date', log_date);
        logData.append('code', crop_code);
        logData.append('name', crop_name);
        logData.append('additional', crop_name);

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/logs',
            type: 'POST',
            data: logData,
            mimeType: 'multipart/form-data',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            contentType: false,
            processData: false,
            success: (response) => {
                console.log('Log saved successfully:', response);
                saveDetails(logData);
            },
            error: function(error) {
                console.error('Error saving log:', error);
            }
        });
    });

    function saveDetails(logData) {
        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/cropLogs',
            type: 'POST',
            data: logData,
            mimeType: 'multipart/form-data',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            contentType: false,
            processData: false,
            success: (response) => {
                console.log('Log saved successfully:', response);
                loadCropLogsTable();
            },
            error: function(error) {
                console.error('Error saving crop log:', error);
            }
        });
    }

    $('#update-crop-logs').on('click', () => {
        var log_code = $('#txtLogCodeCrop').val();
        var img = $('#txtLogImageCrop').prop('files')[0];
        var details = $('#txtCropDetails').val();
        var log_date = $('#txtLogDateCrop').val();
        var crop_code = $('#txtCropCodeLogs').val();
        var crop_name = $('#txtCropNameLogs').val();

        var isLogCodeValid = log_code.startsWith("CL") && /^\d+$/.test(log_code.substring(2));
        if (!isLogCodeValid || !img || details === "" || log_date === "" || crop_code === "" || crop_name === "") {
            validateFields();
            return;
        }

        var logData = new FormData();
        logData.append('log_code', log_code);
        logData.append('img', img);
        logData.append('details', details);
        logData.append('log_date', log_date);
        logData.append('code', crop_code);
        logData.append('name', crop_name);
        logData.append('additional', crop_name);

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/cropLogs/' + log_code,
            type: 'PATCH',
            data: logData,
            mimeType: 'multipart/form-data',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            contentType: false,
            processData: false,
            success: (response) => {
                console.log('Log Details updated successfully:', response);
                $.ajax({
                    url: 'http://localhost:8081/greenShadow/api/v1/logs/' + log_code,
                    type: 'PATCH',
                    data: logData,
                    mimeType: 'multipart/form-data',
                    headers: {
                        'Authorization': `Bearer ${getCookies("token")}`,
                    },
                    contentType: false,
                    processData: false,
                    success: (response) => {
                        console.log('Log updated successfully:', response);
                        saveDetails(logData);
                    },
                    error: function(error) {
                        console.error('Error updating log:', error);
                    }
                });
            },
            error: function(error) {
                console.error('Error updating log details:', error);
            }
        });
    });

    $('#delete-crop-logs').on('click', () => {
        var log_code = $('#txtLogCodeCrop').val();
        var details = $('#txtCropDetails').val();
        var log_date = $('#txtLogDateCrop').val();
        var crop_code = $('#txtCropCodeLogs').val();
        var crop_name = $('#txtCropNameLogs').val();

        var isLogCodeValid = log_code.startsWith("CL") && /^\d+$/.test(log_code.substring(2));
        if (!isLogCodeValid  || details === "" || log_date === "" || crop_code === "" || crop_name === "") {
            validateFields();
            return;
        }

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/cropLogs/' + log_code,
            type: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: (response) => {
                console.log('Log Deleted successfully:', response);
                $.ajax({
                    url: 'http://localhost:8081/greenShadow/api/v1/logs/' + log_code,
                    type: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getCookies("token")}`,
                    },
                    success: (response) => {
                        clearFields();
                        loadCropLogsTable();
                    },
                    error: (error) =>{
                        console.error('Error deleting log:', error);
                    }
                });
            },
            error: (error) =>{
                console.error('Log Not Deleted:', error);
            }
        });
    });

    $('#search-crop-logs').on('click', function() {
        const searchQuery = $('#txtSearch-crop-logs').val();
        searchCropLogsByID(searchQuery);
    });

    function searchCropLogsByID(query) {
        const log_code = query.toUpperCase();

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/logs?log_code=' + log_code,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: (logResponse) => {
                console.log('log data:', logResponse);
                $.ajax({
                    url: `http://localhost:8081/greenShadow/api/v1/cropLogs?log_code=` + log_code,
                    type: 'GET',
                    dataType: 'json',
                    headers: {
                        'Authorization': `Bearer ${getCookies("token")}`,
                    },
                    success: function(detailsResponse) {
                        console.log('details data',detailsResponse);

                        const combinedData = populateData(logResponse, detailsResponse);
                        if (Array.isArray(combinedData)) {
                            const log = combinedData.find(
                                data => data.log_code === log_code && data.log_code.startsWith('CL')
                            );

                            if (log) {
                                $('#txtLogCodeCrop').val(log.log_code);
                                $('#txtCropDetails').val(log.details);
                                $('#txtLogDateCrop').val(log.log_date);
                                $('#txtCropCodeLogs').val(log.crop_code);
                                $('#txtCropNameLogs').val(log.crop_name);
                                $('#txtSearch-crop-logs').val("");
                            } else {
                                console.error('Log not found for the given log_code:', log_code);
                            }
                        } else {
                            console.error('Invalid combinedData structure:', combinedData);
                        }
                    },
                    error: function(err) {
                        console.error(`Error loading details data for log_code`, err);
                    }
                });
            },
            error: function(error) {
                console.error('Error searching logs:', error);
                loadCropLogsTable();
            }
        });
    }

    $('#clear-crop-logs').on('click', () => {
        clearFields();
    });
