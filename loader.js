document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                // Parse the JSON string to an object
                document.snap = JSON.parse(event.target.result);
                document.renderSnap();
            
           
            } catch (error) {
                console.error("Error parsing JSON: ", error);
                alert("Invalid JSON file.");
            }
        };

        // Read the file as text
        reader.readAsText(file);
    } else {
        alert("Please select a valid Snapshot file.");
    }
});