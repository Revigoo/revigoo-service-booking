/* =========================================================
   REVIGOO BIKE SERVICE BOOKING
   Main JavaScript
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

/*
  ============================================================
  GOOGLE APPS SCRIPT CONFIGURATION
  ============================================================

  After deploying your Google Apps Script as a Web App,
  paste the Web App URL between the quotation marks below.

  Example:

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/XXXXXXXX/exec";

  DO NOT add API keys or private credentials here.
*/

const GOOGLE_SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form = document.getElementById("serviceForm");

const submitButton = document.getElementById("submitButton");

const registrationNumber =
  document.getElementById("registrationNumber");

const mobileNumber =
  document.getElementById("mobileNumber");

const whatsappNumber =
  document.getElementById("whatsappNumber");

const email =
  document.getElementById("email");

const manufacturingYear =
  document.getElementById("manufacturingYear");

const pickupDate =
  document.getElementById("pickupDate");

const useCurrentLocationButton =
  document.getElementById("useCurrentLocation");

const latitude =
  document.getElementById("latitude");

const longitude =
  document.getElementById("longitude");

const locationStatus =
  document.getElementById("locationStatus");

const bikePhotos =
  document.getElementById("bikePhotos");

const photoPreview =
  document.getElementById("photoPreview");

const serviceError =
  document.getElementById("serviceError");

const consent =
  document.getElementById("consent");

const consentError =
  document.getElementById("consentError");

const progressFill =
  document.getElementById("progressFill");

const progressSteps =
  document.querySelectorAll(".progress-steps span");

const successScreen =
  document.getElementById("successScreen");

const requestIdDisplay =
  document.getElementById("requestIdDisplay");


/* =========================================================
   STATE
========================================================= */

let selectedPhotos = [];

let isSubmitting = false;


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setMinimumPickupDate();

  setupRegistrationNumber();

  setupPhoneInputs();

  setupPhotoUpload();

  setupProgressTracking();

});


/* =========================================================
   DATE
========================================================= */

function setMinimumPickupDate() {

  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  pickupDate.min = `${year}-${month}-${day}`;
}


/* =========================================================
   REGISTRATION NUMBER
========================================================= */

function setupRegistrationNumber() {

  registrationNumber.addEventListener("input", () => {

    registrationNumber.value =
      registrationNumber.value.toUpperCase();

  });

}


/* =========================================================
   PHONE INPUT
========================================================= */

function setupPhoneInputs() {

  [mobileNumber, whatsappNumber].forEach(input => {

    input.addEventListener("input", () => {

      input.value =
        input.value.replace(/\D/g, "").slice(0, 10);

    });

  });

}


/* =========================================================
   PHOTO UPLOAD
========================================================= */

function setupPhotoUpload() {

  bikePhotos.addEventListener("change", event => {

    const files =
      Array.from(event.target.files);

    if (!files.length) {
      return;
    }


    const availableSlots =
      4 - selectedPhotos.length;

    if (availableSlots <= 0) {

      showTemporaryMessage(
        "You can upload a maximum of 4 photos."
      );

      bikePhotos.value = "";

      return;
    }


    const filesToAdd =
      files.slice(0, availableSlots);


    filesToAdd.forEach(file => {

      if (!file.type.startsWith("image/")) {
        return;
      }

      selectedPhotos.push(file);

    });


    renderPhotoPreviews();

    /*
      Reset the file input so the customer can select
      the same file again if needed.
    */

    bikePhotos.value = "";

  });

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function renderPhotoPreviews() {

  photoPreview.innerHTML = "";

  selectedPhotos.forEach((file, index) => {

    const wrapper =
      document.createElement("div");

    wrapper.className = "photo-item";


    const image =
      document.createElement("img");

    image.alt =
      `Bike photo ${index + 1}`;


    const reader =
      new FileReader();


    reader.onload = event => {

      image.src =
        event.target.result;

    };


    reader.readAsDataURL(file);


    const removeButton =
      document.createElement("button");

    removeButton.type = "button";

    removeButton.className =
      "remove-photo";

    removeButton.setAttribute(
      "aria-label",
      `Remove photo ${index + 1}`
    );

    removeButton.textContent = "×";


    removeButton.addEventListener(
      "click",
      () => {

        selectedPhotos.splice(index, 1);

        renderPhotoPreviews();

      }
    );


    wrapper.appendChild(image);

    wrapper.appendChild(removeButton);

    photoPreview.appendChild(wrapper);

  });

}


/* =========================================================
   CURRENT LOCATION
========================================================= */

useCurrentLocationButton.addEventListener(
  "click",
  getCurrentLocation
);


function getCurrentLocation() {

  clearLocationMessage();


  if (!navigator.geolocation) {

    showLocationError(
      "Location services are not available on this device."
    );

    return;
  }


  useCurrentLocationButton.disabled = true;

  useCurrentLocationButton.innerHTML =
    "<span>◎</span> Finding location...";


  navigator.geolocation.getCurrentPosition(

    position => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;


      latitude.value =
        lat.toFixed(6);

      longitude.value =
        lng.toFixed(6);


      showLocationSuccess(
        "Your current location has been added."
      );


      useCurrentLocationButton.disabled = false;

      useCurrentLocationButton.innerHTML =
        "<span>◎</span> Use My Current Location";

    },


    error => {

      let message =
        "We couldn't get your location. Please enter the location manually.";


      if (error.code === 1) {

        message =
          "Location permission was denied. Please allow location access and try again.";

      } else if (error.code === 2) {

        message =
          "Your location is currently unavailable. Please try again.";

      } else if (error.code === 3) {

        message =
          "Location request timed out. Please try again.";

      }


      showLocationError(message);


      useCurrentLocationButton.disabled = false;

      useCurrentLocationButton.innerHTML =
        "<span>◎</span> Use My Current Location";

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

}


/* =========================================================
   LOCATION MESSAGES
========================================================= */

function showLocationSuccess(message) {

  locationStatus.textContent = message;

  locationStatus.classList.remove("error");

  locationStatus.classList.add("visible");

}


function showLocationError(message) {

  locationStatus.textContent = message;

  locationStatus.classList.add("error");

  locationStatus.classList.add("visible");

}


function clearLocationMessage() {

  locationStatus.textContent = "";

  locationStatus.classList.remove(
    "visible",
    "error"
  );

}


/* =========================================================
   PROGRESS INDICATOR
========================================================= */

function setupProgressTracking() {

  const sections =
    document.querySelectorAll(
      ".form-section"
    );


  const observer =
    new IntersectionObserver(

      entries => {

        const visibleSections =
          entries
            .filter(entry => entry.isIntersecting)
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );


        if (!visibleSections.length) {
          return;
        }


        const currentStep =
          Number(
            visibleSections[0]
              .target
              .dataset
              .step
          );


        updateProgress(currentStep);

      },

      {
        threshold: 0.25
      }

    );


  sections.forEach(section => {

    observer.observe(section);

  });

}


function updateProgress(step) {

  const percentage =
    Math.min(
      100,
      Math.max(
        20,
        step * 20
      )
    );


  progressFill.style.width =
    `${percentage}%`;


  progressSteps.forEach(
    (element, index) => {

      element.classList.toggle(
        "active",
        index < step
      );

    }
  );

}


/* =========================================================
   VALIDATION HELPERS
========================================================= */

function showFieldError(input, message) {

  input.classList.add("invalid");

  const error =
    input.parentElement.querySelector(
      ".error-message"
    );


  if (error) {

    error.textContent =
      message;

    error.classList.add(
      "visible"
    );

  }

}


function clearFieldError(input) {

  input.classList.remove(
    "invalid"
  );


  const error =
    input.parentElement.querySelector(
      ".error-message"
    );


  if (error) {

    error.textContent = "";

    error.classList.remove(
      "visible"
    );

  }

}


/* =========================================================
   CUSTOMER VALIDATION
========================================================= */

function validateCustomerDetails() {

  let valid = true;


  const name =
    document.getElementById(
      "customerName"
    );


  if (!name.value.trim()) {

    showFieldError(
      name,
      "Please enter your name."
    );

    valid = false;

  } else {

    clearFieldError(name);

  }


  if (
    !/^[6-9]\d{9}$/.test(
      mobileNumber.value.trim()
    )
  ) {

    showFieldError(
      mobileNumber,
      "Please enter a valid 10-digit mobile number."
    );

    valid = false;

  } else {

    clearFieldError(
      mobileNumber
    );

  }


  if (
    whatsappNumber.value &&
    !/^[6-9]\d{9}$/.test(
      whatsappNumber.value.trim()
    )
  ) {

    showFieldError(
      whatsappNumber,
      "Please enter a valid WhatsApp number."
    );

    valid = false;

  } else {

    clearFieldError(
      whatsappNumber
    );

  }


  if (
    email.value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.value.trim()
    )
  ) {

    showFieldError(
      email,
      "Please enter a valid email address."
    );

    valid = false;

  } else {

    clearFieldError(email);

  }


  return valid;
}


/* =========================================================
   VEHICLE VALIDATION
========================================================= */

function validateVehicleDetails() {

  let valid = true;


  const requiredFields = [
    {
      input: registrationNumber,
      message: "Please enter your bike registration number."
    },
    {
      input: document.getElementById("bikeBrand"),
      message: "Please enter your bike brand."
    },
    {
      input: document.getElementById("bikeModel"),
      message: "Please enter your bike model."
    }
  ];


  requiredFields.forEach(item => {

    if (!item.input.value.trim()) {

      showFieldError(
        item.input,
        item.message
      );

      valid = false;

    } else {

      clearFieldError(
        item.input
      );

    }

  });


  if (manufacturingYear.value) {

    const year =
      Number(
        manufacturingYear.value
      );

    const currentYear =
      new Date().getFullYear();


    if (
      year < 1950 ||
      year > currentYear
    ) {

      showFieldError(
        manufacturingYear,
        `Please enter a year between 1950 and ${currentYear}.`
      );

      valid = false;

    } else {

      clearFieldError(
        manufacturingYear
      );

    }

  }


  return valid;
}


/* =========================================================
   SERVICE VALIDATION
========================================================= */

function validateServices() {

  const selected =
    document.querySelectorAll(
      'input[name="services"]:checked'
    );


  if (selected.length === 0) {

    serviceError.textContent =
      "Please select at least one service.";

    serviceError.classList.add(
      "visible"
    );

    return false;
  }


  serviceError.textContent = "";

  serviceError.classList.remove(
    "visible"
  );

  return true;
}


/* =========================================================
   PICKUP VALIDATION
========================================================= */

function validatePickupDetails() {

  let valid = true;


  const pickupAddress =
    document.getElementById(
      "pickupAddress"
    );


  if (!pickupAddress.value.trim()) {

    showFieldError(
      pickupAddress,
      "Please enter the pickup address."
    );

    valid = false;

  } else {

    clearFieldError(
      pickupAddress
    );

  }


  if (!pickupDate.value) {

    showFieldError(
      pickupDate,
      "Please select a pickup date."
    );

    valid = false;

  } else {

    clearFieldError(
      pickupDate
    );

  }


  const pickupTime =
    document.getElementById(
      "pickupTime"
    );


  if (!pickupTime.value) {

    showFieldError(
      pickupTime,
      "Please select a pickup time."
    );

    valid = false;

  } else {

    clearFieldError(
      pickupTime
    );

  }


  return valid;
}


/* =========================================================
   CONSENT VALIDATION
========================================================= */

function validateConsent() {

  if (!consent.checked) {

    consentError.textContent =
      "Please agree to be contacted by REVIGOO.";

    consentError.classList.add(
      "visible"
    );

    return false;
  }


  consentError.textContent = "";

  consentError.classList.remove(
    "visible"
  );

  return true;
}


/* =========================================================
   COMPLETE FORM VALIDATION
========================================================= */

function validateForm() {

  const customerValid =
    validateCustomerDetails();


  const vehicleValid =
    validateVehicleDetails();


  const serviceValid =
    validateServices();


  const pickupValid =
    validatePickupDetails();


  const consentValid =
    validateConsent();


  return (
    customerValid &&
    vehicleValid &&
    serviceValid &&
    pickupValid &&
    consentValid
  );
}


/* =========================================================
   GENERATE REQUEST ID
========================================================= */

function generateRequestId() {

  const randomNumber =
    Math.floor(
      100000 +
      Math.random() * 900000
    );


  return `REV-REQ-${randomNumber}`;

}


/* =========================================================
   FORM DATA COLLECTION
========================================================= */

function collectFormData(requestId) {

  const selectedServices =
    Array.from(
      document.querySelectorAll(
        'input[name="services"]:checked'
      )
    ).map(
      checkbox => checkbox.value
    );


  const data = {

    timestamp:
      new Date().toISOString(),

    requestId,

    customerName:
      document.getElementById(
        "customerName"
      ).value.trim(),

    mobileNumber:
      mobileNumber.value.trim(),

    whatsappNumber:
      whatsappNumber.value.trim(),

    email:
      email.value.trim(),

    registrationNumber:
      registrationNumber.value.trim().toUpperCase(),

    bikeBrand:
      document.getElementById(
        "bikeBrand"
      ).value.trim(),

    bikeModel:
      document.getElementById(
        "bikeModel"
      ).value.trim(),

    manufacturingYear:
      manufacturingYear.value.trim(),

    odometer:
      document.getElementById(
        "odometer"
      ).value.trim(),

    services:
      selectedServices,

    issueDescription:
      document.getElementById(
        "issueDescription"
      ).value.trim(),

    pickupAddress:
      document.getElementById(
        "pickupAddress"
      ).value.trim(),

    googleMapsLink:
      document.getElementById(
        "googleMapsLink"
      ).value.trim(),

    latitude:
      latitude.value.trim(),

    longitude:
      longitude.value.trim(),

    pickupDate:
      pickupDate.value,

    pickupTime:
      document.getElementById(
        "pickupTime"
      ).value,

    consent:
      consent.checked,

    status:
      "New",

    assignedGarage:
      "",

    createdBy:
      "Customer Website"

  };


  return data;
}


/* =========================================================
   GOOGLE SHEETS SUBMISSION
========================================================= */

/*
  ============================================================
  GOOGLE APPS SCRIPT SUBMISSION FUNCTION
  ============================================================

  This function is intentionally separated from the rest
  of the application.

  Once you have your Apps Script Web App URL:

  1. Replace GOOGLE_SCRIPT_URL above.
  2. Keep the function below unchanged unless your Apps
     Script requires a different payload.

  The photos are NOT uploaded here.

  A future image-upload API can be added separately.
*/

async function submitToGoogleSheets(formData) {

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL ===
      "YOUR_GOOGLE_APPS_SCRIPT_URL"
  ) {

    /*
      Development mode:

      The form will work without a backend.
      Data is logged to the browser console.

      This allows you to test the frontend before
      connecting Google Sheets.
    */

    console.log(
      "REVIGOO Form Data:",
      formData
    );


    /*
      Simulate a successful submission.

      Remove this development block after
      connecting your Apps Script.
    */

    await delay(700);

    return {
      success: true,
      developmentMode: true
    };
  }


  try {

    const response =
      await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(formData)
        }
      );


    if (!response.ok) {

      throw new Error(
        "Submission failed"
      );

    }


    /*
      Apps Script may return JSON.

      If parsing fails, we still treat a successful
      HTTP response as successful.
    */

    let result = null;

    try {

      result =
        await response.json();

    } catch (error) {

      result = {
        success: true
      };

    }


    return result;

  } catch (error) {

    console.error(
      "REVIGOO submission error:",
      error
    );


    throw new Error(
      "Unable to submit request"
    );

  }

}


/* =========================================================
   FORM SUBMISSION
========================================================= */

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    /*
      Prevent duplicate submissions.
    */

    if (isSubmitting) {

      showTemporaryMessage(
        "Your request is already being submitted."
      );

      return;
    }


    /*
      Validate everything before submission.
    */

    const valid =
      validateForm();


    if (!valid) {

      const firstInvalid =
        document.querySelector(
          ".invalid"
        );


      if (firstInvalid) {

        firstInvalid.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        setTimeout(
          () => firstInvalid.focus(),
          350
        );

      }


      return;
    }


    /*
      Lock submission.
    */

    isSubmitting = true;

    setSubmitLoading(true);


    try {

      const requestId =
        generateRequestId();


      const formData =
        collectFormData(
          requestId
        );


      /*
        Submit to Google Apps Script.
      */

      await submitToGoogleSheets(
        formData
      );


      /*
        Show success screen.
      */

      showSuccessScreen(
        requestId
      );


    } catch (error) {

      /*
        Never expose technical details
        to the customer.
      */

      showTemporaryMessage(
        "Something went wrong. Please try again."
      );


    } finally {

      isSubmitting = false;

      setSubmitLoading(false);

    }

  }
);


/* =========================================================
   LOADING STATE
========================================================= */

function setSubmitLoading(loading) {

  submitButton.disabled =
    loading;

  submitButton.classList.toggle(
    "loading",
    loading
  );

}


/* =========================================================
   SUCCESS SCREEN
========================================================= */

function showSuccessScreen(requestId) {

  requestIdDisplay.textContent =
    requestId;


  form.style.display =
    "none";


  document.querySelector(
    ".progress-wrapper"
  ).style.display =
    "none";


  successScreen.classList.remove(
    "hidden"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   TEMPORARY MESSAGE
========================================================= */

function showTemporaryMessage(message) {

  /*
    Lightweight customer-facing message.

    No technical error is shown.
  */

  const existing =
    document.querySelector(
      ".temporary-message"
    );


  if (existing) {
    existing.remove();
  }


  const messageElement =
    document.createElement(
      "div"
    );


  messageElement.className =
    "temporary-message";


  messageElement.textContent =
    message;


  Object.assign(
    messageElement.style,
    {
      position: "fixed",
      left: "50%",
      bottom: "25px",
      transform: "translateX(-50%)",
      zIndex: "9999",
      width: "calc(100% - 30px)",
      maxWidth: "500px",
      padding: "13px 16px",
      borderRadius: "12px",
      background: "#252525",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "600",
      textAlign: "center",
      boxShadow:
        "0 10px 30px rgba(0,0,0,.2)"
    }
  );


  document.body.appendChild(
    messageElement
  );


  setTimeout(() => {

    messageElement.remove();

  }, 3500);

}


/* =========================================================
   UTILITY
========================================================= */

function delay(milliseconds) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}