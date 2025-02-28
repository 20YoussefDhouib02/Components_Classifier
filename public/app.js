// Dropzone configuration
Dropzone.autoDiscover = false;

function init() {
  let dz = new Dropzone("#dropzone", {
    url: "/",
    maxFiles: 1,
    addRemoveLinks: true,
    dictDefaultMessage: "Some Message",
    autoProcessQueue: false,
  });

  dz.on("addedfile", function (file) {
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
    
    // Display image preview
    const reader = new FileReader();
    reader.onload = function(e) {
      const resultHolder = document.getElementById('resultHolder');
      resultHolder.innerHTML = `
        <div class="preview-container">
          <p class="upload-text">Image Preview</p>
          <div class="image-preview">
            <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 4px;">
          </div>
        </div>
      `;
      // Show the preview section
      $("#resultHolder").show();
    };
    reader.readAsDataURL(file);
    
    // Reset results
    resetResults();
  });

  dz.on("complete", function (file) {
    var url = "http://127.0.0.1:5000/classify_image";

    $.post(
      url,
      {
        image_data: file.dataURL,
      },
      function (data, status) {
        console.log(data);
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          showError("Could not classify the image. Please try another image.");
          return;
        }
        
        let components = [
          "capacitor",
          "diode",
          "integrated_circuit",
          "resistor",
          "transistor",
        ];

        let match = null;
        let bestScore = -1;
        for (let i = 0; i < data.length; ++i) {
          let maxScoreForThisClass = Math.max(...data[i].class_probability);
          if (maxScoreForThisClass > bestScore) {
            match = data[i];
            bestScore = maxScoreForThisClass;
          }
        }
        
        if (match) {
          hideError();
          $("#resultHolder").show();
          $("#divClassTable").show();
          
          // Convert results to the format expected by updateResults
          let results = {};
          let classDictionary = match.class_dictionary;
          
          for (let componentName in classDictionary) {
            let index = classDictionary[componentName];
            let probabilityScore = match.class_probability[index];
            results[componentName] = probabilityScore;
          }
          
          // Update UI with results
          updateResults(results);
        }
      }
    );
  });

  $("#submitBtn").on("click", function (e) {
    if (dz.files.length === 0) {
      alert("Please upload an image first");
      return;
    }
    
    // Show loading state
    showLoading();
    
    // Process the queue (upload the file)
    dz.processQueue();
  });
}

// Function to show loading state
function showLoading() {
  // Add loading spinner to each result cell
  const components = [
    "capacitor",
    "diode",
    "integrated_circuit",
    "resistor",
    "transistor"
  ];
  
  components.forEach(component => {
    const cell = document.getElementById(`score_${component}`);
    if (cell) {
      cell.innerHTML = `
        <div class="text-center">
          <div class="loading-spinner"></div>
        </div>
      `;
    }
  });
  
  // Show the results table
  $("#divClassTable").show();
}

// Function to update results
function updateResults(results) {
  // Find highest probability component
  const highestComponent = Object.entries(results)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Update each row
  Object.entries(results).forEach(([component, score]) => {
    const cell = document.getElementById(`score_${component}`);
    if (cell) {
      const percentage = (score).toFixed(1);
      
      cell.innerHTML = `
        <div class="progress-container">
          <div class="progress-bar" style="width: ${percentage}%"></div>
          <span class="progress-text">${percentage}%</span>
        </div>
      `;
      
      // Highlight the row with highest probability
      const row = cell.parentElement;
      if (component === highestComponent) {
        row.classList.add('highlight');
      } else {
        row.classList.remove('highlight');
      }
    }
  });
}

// Function to reset results
function resetResults() {
  const components = [
    "capacitor",
    "diode",
    "integrated_circuit",
    "resistor",
    "transistor"
  ];
  
  components.forEach(component => {
    const cell = document.getElementById(`score_${component}`);
    if (cell) {
      cell.innerHTML = `
        <div class="progress-container">
          <div class="progress-bar" style="width: 0%"></div>
          <span class="progress-text">0%</span>
        </div>
      `;
      
      // Remove highlight
      const row = cell.parentElement;
      row.classList.remove('highlight');
    }
  });
}

// Function to show error message
function showError(message) {
  // Create error element if it doesn't exist
  if ($("#error").length === 0) {
    $("main .container").prepend('<div id="error" class="error-message"></div>');
  }
  
  $("#error").html(message);
  $("#error").show();
}

// Function to hide error message
function hideError() {
  $("#error").hide();
}

$(document).ready(function () {
  console.log("ready!");
  
  // Create error element if it doesn't exist
  if ($("#error").length === 0) {
    $("main .container").prepend('<div id="error" class="error-message"></div>');
  }
  
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();

  init();
});