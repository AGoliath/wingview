document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            let snap = null;
            try {
                snap = JSON.parse(event.target.result);

            } catch (error) {
                console.error("Error reading JSON: ", error);
                alert("Your File seems to be not a valid JSON, please check if it actually is a Behringer Wing Snapshot file");
                return;
            }
            let connections, nodes;
            try {
                [connections, nodes] = document.parseSnap(snap);
            } catch (error) {
                console.error("Error parsing the snapshot file: ", error);
                alert("Your Snapshot file was not parsed correctly. Most likely you are using something that is not supported yet. Please open a github issue or post in the forum (see bottom of Known issues list)");
                return;
            }

            try {
                document.renderSnap(connections, nodes);
            } catch (error) {
                console.error("Error parsing the snapshot file: ", error);
                alert("Your Snapshot file was not parsed correctly. Most likely you are using something that is not supported yet. Please open a github issue or post in the forum (see bottom of Known issues list)");
                return;
            }

        };


        // Read the file as text
        reader.readAsText(file);
    } else {
        alert("Please select a valid Snapshot file.");
    }
});