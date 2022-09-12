
//if no document open, ask for one
if (app.documents.length == 0) {
    Main();
}

var folderAddress;
var eps;

function Main() {

    alert("Please select an image from the folder you wish to convert.\n\nFiles will be outputted as: \nCMYK, 300dpi, .tiff");
    //asks the user to select an image
    var selectedImage = openDialog();

    //if user doesnt select an image
    if (selectedImage == "") { alert("No image selected, script stopped"); return; }
    
    //takes the select image and makes it the active document
    app.open(selectedImage[0]);

    //gets the images folder for saving
    folderAddress = app.activeDocument.path;
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)

    //gets all paths for all images in the folder
    var files = folderAddress.getFiles();

    var shouldContinue = confirm("There are " + files.length + " files in this folder, do you want to continue?");

    if (shouldContinue == false) return;




    var CYMKfolder = Folder(folderAddress + "/CMYK");
    //Check if it exist, if not create it.
    if (!CYMKfolder.exists) CYMKfolder.create();

    eps = confirm("Do you want .eps files as well as .tiff?");
    if (eps) {
        var EPSfolder = Folder(folderAddress + "/EPS");
        //Check if it exist, if not create it.
        if (!EPSfolder.exists) EPSfolder.create();
    }

    //for each loaded image
    for (var i = 0; i < files.length; i++) {
        PrepSingleImage(files[i])
    }

    alert("Finished");
}

/*Takes an image address, loads it, creates a copy and then saves*/
function PrepSingleImage(FileAddress) {

    //used for checking if the file has an extension
    //if the file has no .s, its likely not to be a file
    var addressString = FileAddress.toString();
    var extensionDot = addressString.lastIndexOf(".");
    if (extensionDot == -1) return;

    var workingImage = app.open(FileAddress);
    //finds where the file extension starts
    var lastDot = workingImage.name.lastIndexOf(".");
    var filename = workingImage.name.substring(0, lastDot);

    //creates a new document to allow the colour mode swap
    app.documents.add(workingImage.width, workingImage.height, 300, "temp.tiff", NewDocumentMode.CMYK)

    var original = app.documents[0];
    var copy = app.documents[1];
    activeDocument = original;
    var curLayer = original.activeLayer

    //duplicate selected layer onto new document
    curLayer.duplicate(copy, ElementPlacement.PLACEATEND)
    activeDocument = copy;

    //resizes the document to 300dpi
    app.activeDocument.resizeImage(undefined, undefined, 300, ResampleMethod.NONE);
   
    SaveTiff(filename, folderAddress);
    if (eps) { SaveEPS(filename, folderAddress); }
    
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)
}

/*saves the current active document as a tiff when given a name and location*/
function SaveTiff(fileName, saveFolder) {
    var file = new File(saveFolder + '/CMYK/' + fileName + '.tiff');
    var opts = new TiffSaveOptions();
    opts.imageCompression = TIFFEncoding.TIFFLZW;
    opts.layers = false;
    app.activeDocument.saveAs(file, opts, true);
}


/*saves the current active document as a EPS when given a name and location*/
function SaveEPS(fileName, saveFolder) {
    var file = new File(saveFolder + '/EPS/' + fileName + '.eps');
    var opts = new EPSSaveOptions();
    opts.halftoneScreen = true;
    opts.encoding = SaveEncoding.ASCII
    app.activeDocument.saveAs(file, opts, true);
}
