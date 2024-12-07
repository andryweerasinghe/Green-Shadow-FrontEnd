 var recordIndexFields;

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

    function validateField() {
        var fieldID = $('#txtFieldID').val();
        var fieldName = $('#txtFieldName').val();
        var fieldLocation = $('#txtFieldLocation').val();
        var fieldSize = $('#txtFieldSize').val();
        var image_01 = $('#txtFieldImage1').prop('files')[0];
        var image_02 = $('#txtFieldImage2').prop('files')[0];

        if (fieldID === "" || fieldName === "" || fieldLocation === "" || fieldSize === "" || !image_01 || !image_02) {
            if (fieldID === "") {
                $('#txtFieldID').addClass('inValidData-input red').attr("placeholder", "Field ID is required");
            }
            if (fieldName === "") {
                $('#txtFieldName').addClass('inValidData-input red').attr("placeholder", "Field Name is required");
            }
            if (fieldLocation === "") {
                $('#txtFieldLocation').addClass('inValidData-input red').attr("placeholder", "Field Location is required");
            }
            if (fieldSize === "") {
                $('#txtFieldSize').addClass('inValidData-input red').attr("placeholder", "Field Size is required");
            }
            if (!image_01) {
                $('#txtFieldImage1').addClass('inValidData-input red');
            }
            if (!image_02) {
                $('#txtFieldImage2').addClass('inValidData-input red');
            }
        }
    }

     $('#txtFieldID, #txtFieldName, #txtFieldLocation, #txtFieldSize, #txtFieldImage1, #txtFieldImage2').on('input', function () {
         $(this).removeClass('inValidData-input red');

         if ($(this).attr('id') === 'fieldID') {
             $('#txtFieldID').removeClass('inValidData-input red');
         } else if ($(this).attr('id') === 'fieldName') {
             $('#txtFieldName').removeClass('inValidData-input red');
         } else if ($(this).attr('id') === 'fieldLocation') {
             $('#txtFieldLocation').removeClass('inValidData-input red');
         } else if ($(this).attr('id') === 'fieldSize') {
             $('#txtFieldSize').removeClass('inValidData-input red');
         } else if ($(this).attr('id') === 'txtFieldImage1') {
             $('#txtFieldImage1').text("").removeClass('inValidData-input red');
         } else if ($(this).attr('id') === 'txtFieldImage2') {
             $('#txtFieldImage2').text("").removeClass('inValidData-input red');
         }
     });


 function clearFields() {
        $('#txtFieldID').val("").attr("placeholder","");
        $('#txtFieldName').val("").attr("placeholder","");
        $('#txtFieldLocation').val("").attr("placeholder","");
        $('#txtFieldSize').val("").attr("placeholder","");
        $('#txtFieldImage1').val("").attr("placeholder","");
        $('#txtFieldImage2').val("").attr("placeholder","");
        $('#txtSearch-fields').val("").attr("placeholder","");
    }

    export function loadFieldTable() {
        $("#fields-table-tb").empty();

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/field',
            type: 'GET',
            dataType: 'json',
            headers: {
              'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: function(res) {
                $('#field-total').text(res.length);
                if (Array.isArray(res)) {
                    res.forEach(function(field) {
                        var fieldRecord = `
                        <tr>
                            <td class="f-id">${field.field_code}</td>
                            <td class="f-name">${field.field_name}</td>
                            <td class="f-location">${field.field_location}</td>
                            <td class="f-size">${field.extent_size}</td>
                            <td class="f-image-1"><img src="data:image/png;base64,${field.img_01}" width="150px"></td>
                            <td class="f-image-2"><img src="data:image/png;base64,${field.img_02}" width="150px"></td>
                        </tr>`;
                        $('#fields-table-tb').append(fieldRecord);
                    });
                } else {
                    console.log('No field data found or incorrect response format.');
                }
            },
            error: function(res) {
                console.error('Error loading field data:', res);
            }
        });
    }

    $('#fields-table-tb').on('click','tr',function () {
        recordIndexFields = $(this).index();

        var field_code = $(this).find(".f-id").text();
        var field_name = $(this).find(".f-name").text();
        var field_location = $(this).find(".f-location").text();
        var extent_size = $(this).find(".f-size").text();

        $('#txtFieldID').val(field_code);
        $('#txtFieldName').val(field_name);
        $('#txtFieldLocation').val(field_location);
        $('#txtFieldSize').val(extent_size);
    });

    $('#save-fields').on('click', () => {
        var fieldID = $('#txtFieldID').val();
        var fieldName = $('#txtFieldName').val();
        var fieldLocation = $('#txtFieldLocation').val();
        var fieldSize = $('#txtFieldSize').val();
        var image_01 = $('#txtFieldImage1').prop('files')[0];
        var image_02 = $('#txtFieldImage2').prop('files')[0];

        if (!fieldID || !fieldName || !fieldLocation || !fieldSize || !image_01 || !image_02) {
            validateField();
            return;
        }

        var fieldData = new FormData();
        fieldData.append('fieldID', fieldID);
        fieldData.append('fieldName', fieldName);
        fieldData.append('fieldLocation', fieldLocation);
        fieldData.append('fieldSize', fieldSize);
        fieldData.append('image_01', image_01);
        fieldData.append('image_02', image_02);

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/field',
            type: 'POST',
            data: fieldData,
            mimeType: 'multipart/form-data',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            contentType: false,
            processData: false,
            success: (res) => {
                loadFieldTable();
                console.log(res);
                console.log("field saved");
                clearFields();
            },
            error: (res) => {
                console.error(res);
            }
        });
    });

    $('#delete-fields').on('click',() => {
        var field_code = $('#txtFieldID').val();
        var fieldName = $('#txtFieldName').val();
        var fieldLocation = $('#txtFieldLocation').val();
        var fieldSize = $('#txtFieldSize').val();

        if (!field_code || !fieldName || !fieldLocation || !fieldSize) {
            validateField();
            return;
        }

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/field/' + field_code,
            type: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: (res) => {
                console.log(JSON.stringify(res));
                loadFieldTable();
                console.log("Field Deleted");
                clearFields();
            },
            error: (res) => {
                console.error(res);
                console.log("Field Not Deleted");
            }
        });
    });

    $('#update-fields').on('click', () => {
        var field_code = $('#txtFieldID').val();
        var fieldName = $('#txtFieldName').val();
        var fieldLocation = $('#txtFieldLocation').val();
        var fieldSize = $('#txtFieldSize').val();
        var image_01 = $('#txtFieldImage1').prop('files')[0];
        var image_02 = $('#txtFieldImage2').prop('files')[0];

        if (!field_code || !fieldName || !fieldLocation || !fieldSize || !image_01 || !image_02) {
            validateField();
            return;
        }

        var fieldData = new FormData();
        fieldData.append('fieldID', field_code);
        fieldData.append('fieldName', fieldName);
        fieldData.append('fieldLocation', fieldLocation);
        fieldData.append('fieldSize', fieldSize);
        fieldData.append('image_01', image_01);
        fieldData.append('image_02', image_02);

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/field/' + field_code,
            type: 'PATCH',
            data: fieldData,
            mimeType: 'multipart/form-data',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            contentType: false,
            processData: false,
            success: (res) => {
                loadFieldTable();
                console.log(res);
                console.log("field updated");
                clearFields();
            },
            error: (res) => {
                console.error(res);
            }
        });
    });

    $('#search-field').on('click', function() {
        const searchQuery = $('#txtSearch-fields').val();
        searchFieldsByID(searchQuery);
    });

    function searchFieldsByID(query) {
        const field_code = query.toLowerCase();

        $.ajax({
            url: 'http://localhost:8081/greenShadow/api/v1/field?field_code=' + field_code,
            type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': `Bearer ${getCookies("token")}`,
            },
            success: (response) => {
                console.log('Full response:', response);
                for (let i = 0; i < response.length; i++) {
                    if (field_code === response[i].field_code) {
                        var field = response[i];
                        break;
                    }
                }

                if (field) {
                    console.log('Field retrieved successfully:', field);

                    $('#txtFieldID').val(field.field_code);
                    $('#txtFieldName').val(field.field_name);
                    $('#txtFieldLocation').val(field.field_location);
                    $('#txtFieldSize').val(field.extent_size);
                    $('#txtSearch-fields').val("");
                } else {
                    console.error('Field not found');
                }
            },
            error: function(error) {
                console.error('Error searching field:', error);
                loadFieldTable();
            }
        });
    }

    $('#clear-fields').on('click', () => {
        clearFields();
    });