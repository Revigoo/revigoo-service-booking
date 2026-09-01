/* =========================================================
   REVIGOO SERVICE BOOKING
   Frontend JavaScript
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT CONFIGURATION
========================================================= */

/*
  IMPORTANT:

  After deploying your Google Apps Script Web App,
  paste the Web App URL here.

  Example:

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";

*/

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw48f5hoyW9IZbgQPpAf5o72YUYxbrPxqDc7Ll2n81Syd40Y62CEAUhPA-gWoeUsLIT/exec";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

const form =
  document.getElementById("serviceForm");

const panels =
  [...document.querySelectorAll(".step-panel")];

const stepButtons =
  [...document.querySelectorAll(".step")];

const progressFill =
  document.getElementById("progressFill");

const stepLabel =
  document.getElementById("stepLabel");

const stepTitle =
  document.getElementById("stepTitle");

const backButton =
  document.getElementById("backButton");

const nextButton =
  document.getElementById("nextButton");

const submitButton =
  document.getElementById("submitButton");

const successScreen =
  document.getElementById("successScreen");


let currentStep = 1;

let submitting = false;

let photos = [];


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


function initializeApp() {

  setMinimumPickupDate();


  /* -------------------------------------------------------
     REGISTRATION NUMBER
  ------------------------------------------------------- */

  const registration =
    document.getElementById(
      "registrationNumber"
    );


  if (registration) {

    registration.addEventListener(
      "input",
      function () {

        this.value =
          this.value
            .toUpperCase();

      }
    );

  }


  /* -------------------------------------------------------
     PHONE NUMBERS
  ------------------------------------------------------- */

  const mobileFields = [
    "mobileNumber",
    "whatsappNumber"
  ];


  mobileFields.forEach(
    function (id) {

      const input =
        document.getElementById(id);


      if (!input) {
        return;
      }


      input.addEventListener(
        "input",
        function () {

          this.value =
            this.value
              .replace(/\D/g, "")
              .slice(0, 10);

        }
      );

    }
  );


  /* -------------------------------------------------------
     CURRENT LOCATION
  ------------------------------------------------------- */

  const locationButton =
    document.getElementById(
      "useCurrentLocation"
    );


  if (locationButton) {

    locationButton.addEventListener(
      "click",
      getCurrentLocation
    );

  }


  /* -------------------------------------------------------
     GOOGLE MAPS LINK
  ------------------------------------------------------- */

  const mapsLink =
    document.getElementById(
      "googleMapsLink"
    );


  if (mapsLink) {

    mapsLink.addEventListener(
      "input",
      updateMapPreview
    );

  }


  /* -------------------------------------------------------
     PHOTO UPLOAD
  ------------------------------------------------------- */

  const photoInput =
    document.getElementById(
      "bikePhotos"
    );


  if (photoInput) {

    photoInput.addEventListener(
      "change",
      handlePhotos
    );

  }


  /* -------------------------------------------------------
     NEXT
  ------------------------------------------------------- */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      function () {

        if (
          !validateStep(
            currentStep
          )
        ) {

          return;

        }


        if (
          currentStep === 4
        ) {

          buildReview();

        }


        if (
          currentStep < 5
        ) {

          showStep(
            currentStep + 1
          );

        }

      }
    );

  }


  /* -------------------------------------------------------
     BACK
  ------------------------------------------------------- */

  if (backButton) {

    backButton.addEventListener(
      "click",
      function () {

        if (
          currentStep > 1
        ) {

          showStep(
            currentStep - 1
          );

        }

      }
    );

  }


  /* -------------------------------------------------------
     STEP BUTTONS
  ------------------------------------------------------- */

  stepButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const target =
            Number(
              this.dataset.step
            );


          if (
            target < currentStep
          ) {

            showStep(target);

            return;

          }


          if (
            target > currentStep &&
            validateStepsBefore(target)
          ) {

            showStep(target);

          }

        }
      );

    }
  );


  /* -------------------------------------------------------
     FINAL SUBMIT
  ------------------------------------------------------- */

  if (form) {

    form.addEventListener(
      "submit",
      submitForm
    );

  }


  /* -------------------------------------------------------
     INITIAL STEP
  ------------------------------------------------------- */

  showStep(1);

}


/* =========================================================
   STEP NAVIGATION
========================================================= */

function showStep(step) {

  currentStep = step;


  /* -------------------------------------------------------
     PANELS
  ------------------------------------------------------- */

  panels.forEach(
    function (panel) {

      const panelStep =
        Number(
          panel.dataset.panel
        );


      panel.classList.toggle(
        "active",
        panelStep === step
      );

    }
  );


  /* -------------------------------------------------------
     STEP INDICATORS
  ------------------------------------------------------- */

  stepButtons.forEach(
    function (button) {

      const buttonStep =
        Number(
          button.dataset.step
        );


      button.classList.toggle(
        "active",
        buttonStep === step
      );

    }
  );


  /* -------------------------------------------------------
     PROGRESS
  ------------------------------------------------------- */

  if (progressFill) {

    progressFill.style.width =
      `${step * 20}%`;

  }


  /* -------------------------------------------------------
     STEP TEXT
  ------------------------------------------------------- */

  const stepNames = [

    "Customer",
    "Bike",
    "Service",
    "Pickup",
    "Confirm"

  ];


  if (stepLabel) {

    stepLabel.textContent =
      `Step ${step} of 5`;

  }


  if (stepTitle) {

    stepTitle.textContent =
      stepNames[step - 1];

  }


  /* -------------------------------------------------------
     BACK BUTTON
  ------------------------------------------------------- */

  if (backButton) {

    backButton.classList.toggle(
      "hidden",
      step === 1
    );

  }


  /* -------------------------------------------------------
     NEXT BUTTON
  ------------------------------------------------------- */

  if (nextButton) {

    nextButton.classList.toggle(
      "hidden",
      step === 5
    );

  }


  /* -------------------------------------------------------
     SUBMIT BUTTON
  ------------------------------------------------------- */

  if (submitButton) {

    submitButton.classList.toggle(
      "hidden",
      step !== 5
    );

  }


  /* -------------------------------------------------------
     REVIEW
  ------------------------------------------------------- */

  if (
    step === 5
  ) {

    buildReview();

  }


  /* -------------------------------------------------------
     SCROLL
  ------------------------------------------------------- */

  const booking =
    document.getElementById(
      "booking"
    );


  if (booking) {

    window.scrollTo({

      top:
        booking.offsetTop - 10,

      behavior:
        "smooth"

    });

  }

}


/* =========================================================
   VALIDATE PREVIOUS STEPS
========================================================= */

function validateStepsBefore(
  target
) {

  for (
    let i = 1;
    i < target;
    i++
  ) {

    if (
      !validateStep(i)
    ) {

      showStep(i);

      return false;

    }

  }


  return true;

}


/* =========================================================
   VALIDATE STEP
========================================================= */

function validateStep(step) {

  clearErrors();


  /* =======================================================
     STEP 1 - CUSTOMER
  ====================================================== */

  if (
    step === 1
  ) {

    let valid = true;


    const name =
      document.getElementById(
        "customerName"
      );

    const mobile =
      document.getElementById(
        "mobileNumber"
      );

    const whatsapp =
      document.getElementById(
        "whatsappNumber"
      );

    const email =
      document.getElementById(
        "email"
      );


    /* Name */

    if (
      !name.value.trim()
    ) {

      fieldError(
        name,
        "Please enter your name."
      );

      valid = false;

    }


    /* Mobile */

    if (
      !/^[6-9]\d{9}$/.test(
        mobile.value.trim()
      )
    ) {

      fieldError(
        mobile,
        "Please enter a valid 10-digit mobile number."
      );

      valid = false;

    }


    /* WhatsApp - optional */

    if (
      whatsapp.value.trim() &&
      !/^[6-9]\d{9}$/.test(
        whatsapp.value.trim()
      )
    ) {

      fieldError(
        whatsapp,
        "Please enter a valid 10-digit WhatsApp number."
      );

      valid = false;

    }


    /* Email - optional */

    if (
      email.value.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.value.trim()
      )
    ) {

      fieldError(
        email,
        "Please enter a valid email address."
      );

      valid = false;

    }


    return valid;

  }


  /* =======================================================
     STEP 2 - BIKE
  ====================================================== */

  if (
    step === 2
  ) {

    let valid = true;


    const requiredFields = [

      "registrationNumber",
      "bikeBrand",
      "bikeModel"

    ];


    requiredFields.forEach(
      function (id) {

        const input =
          document.getElementById(id);


        if (
          !input.value.trim()
        ) {

          fieldError(
            input,
            "This field is required."
          );

          valid = false;

        }

      }
    );


    return valid;

  }


  /* =======================================================
     STEP 3 - SERVICE
  ====================================================== */

  if (
    step === 3
  ) {

    const selectedServices =
      document.querySelectorAll(
        'input[name="services"]:checked'
      );


    if (
      selectedServices.length === 0
    ) {

      const serviceError =
        document.getElementById(
          "serviceError"
        );


      if (serviceError) {

        serviceError.textContent =
          "Please select at least one service.";

      }


      return false;

    }


    return true;

  }


  /* =======================================================
     STEP 4 - PICKUP
  ====================================================== */

  if (
    step === 4
  ) {

    let valid = true;


    const address =
      document.getElementById(
        "pickupAddress"
      );

    const mapsLink =
      document.getElementById(
        "googleMapsLink"
      );

    const pickupDate =
      document.getElementById(
        "pickupDate"
      );

    const pickupTime =
      document.getElementById(
        "pickupTime"
      );


    /* Pickup address */

    if (
      !address.value.trim()
    ) {

      fieldError(
        address,
        "Please enter your pickup address."
      );

      valid = false;

    }


    /* Google Maps link REQUIRED */

    if (
      !mapsLink.value.trim()
    ) {

      fieldError(
        mapsLink,
        "Google Maps location is required."
      );

      valid = false;

    }

    else if (
      !isMapsLink(
        mapsLink.value.trim()
      )
    ) {

      fieldError(
        mapsLink,
        "Please enter a valid Google Maps location link."
      );

      valid = false;

    }


    /* Pickup date */

    if (
      !pickupDate.value
    ) {

      fieldError(
        pickupDate,
        "Please select a pickup date."
      );

      valid = false;

    }


    /* Pickup time */

    if (
      !pickupTime.value
    ) {

      fieldError(
        pickupTime,
        "Please select a pickup time."
      );

      valid = false;

    }


    return valid;

  }


  /* =======================================================
     STEP 5 - CONSENT
  ====================================================== */

  if (
    step === 5
  ) {

    const consent =
      document.getElementById(
        "consent"
      );


    if (
      !consent.checked
    ) {

      const consentError =
        document.getElementById(
          "consentError"
        );


      if (consentError) {

        consentError.textContent =
          "Please agree before submitting.";

      }


      return false;

    }


    return true;

  }


  return true;

}


/* =========================================================
   FIELD ERROR
========================================================= */

function fieldError(
  input,
  message
) {

  if (!input) {
    return;
  }


  const field =
    input.closest(".field");


  if (!field) {
    return;
  }


  field.classList.add(
    "invalid"
  );


  const error =
    field.querySelector(
      ".error"
    );


  if (error) {

    error.textContent =
      message;

  }

}


/* =========================================================
   CLEAR ERRORS
========================================================= */

function clearErrors() {

  document
    .querySelectorAll(
      ".field.invalid"
    )
    .forEach(
      function (field) {

        field.classList.remove(
          "invalid"
        );

      }
    );


  document
    .querySelectorAll(
      ".error"
    )
    .forEach(
      function (error) {

        error.textContent =
          "";

      }
    );


  const serviceError =
    document.getElementById(
      "serviceError"
    );


  if (serviceError) {

    serviceError.textContent =
      "";

  }


  const consentError =
    document.getElementById(
      "consentError"
    );


  if (consentError) {

    consentError.textContent =
      "";

  }

}


/* =========================================================
   MINIMUM PICKUP DATE
========================================================= */

function setMinimumPickupDate() {

  const dateInput =
    document.getElementById(
      "pickupDate"
    );


  if (!dateInput) {
    return;
  }


  const today =
    new Date();


  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");


  dateInput.min =
    `${year}-${month}-${day}`;

}


/* =========================================================
   GOOGLE MAPS LINK VALIDATION
========================================================= */

function isMapsLink(value) {

  try {

    const url =
      new URL(value);


    const hostname =
      url.hostname.toLowerCase();


    /*
      Accept:

      google.com/maps
      www.google.com/maps
      maps.google.com
      maps.app.goo.gl
      goo.gl
    */

    return (

      hostname ===
        "google.com" ||

      hostname.endsWith(
        ".google.com"
      ) ||

      hostname ===
        "maps.google.com" ||

      hostname ===
        "goo.gl" ||

      hostname ===
        "maps.app.goo.gl"

    ) && (

      url.pathname.includes(
        "/maps"
      ) ||

      hostname ===
        "maps.app.goo.gl" ||

      hostname ===
        "goo.gl"

    );

  }

  catch {

    return false;

  }

}


/* =========================================================
   CURRENT LOCATION
========================================================= */

function getCurrentLocation() {

  const button =
    document.getElementById(
      "useCurrentLocation"
    );

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (
    !navigator.geolocation
  ) {

    showLocationError(
      "Location is not supported on this device."
    );

    return;

  }


  /* Loading */

  button.disabled =
    true;

  button.textContent =
    "◎ Finding your location...";


  status.className =
    "location-status";


  status.textContent =
    "Please allow location access when your browser asks.";


  /*
    Request GPS location.
  */

  navigator.geolocation.getCurrentPosition(

    function (position) {

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;


      /*
        Google Maps URL.

        Example:

        https://www.google.com/maps?q=10.123456,76.123456
      */

      const mapsURL =
        `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;


      /*
        Store coordinates.
      */

      document.getElementById(
        "latitude"
      ).value =
        latitude.toFixed(6);


      document.getElementById(
        "longitude"
      ).value =
        longitude.toFixed(6);


      /*
        Store Google Maps link.
      */

      document.getElementById(
        "googleMapsLink"
      ).value =
        mapsURL;


      /*
        Success.
      */

      status.className =
        "location-status success";


      status.textContent =
        "✓ Location captured successfully.";


      /*
        Restore button.
      */

      button.disabled =
        false;

      button.textContent =
        "✓ Location Captured";


      /*
        Enable map button.
      */

      updateMapPreview();


      /*
        Restore normal button text.
      */

      setTimeout(
        function () {

          button.textContent =
            "◎ Use My Current Location";

        },
        2500
      );

    },


    function (error) {

      button.disabled =
        false;


      button.textContent =
        "◎ Use My Current Location";


      let message =
        "We couldn't get your location. Please try again.";


      if (
        error.code === 1
      ) {

        message =
          "Location permission was denied. Please allow location access and try again.";

      }

      else if (
        error.code === 2
      ) {

        message =
          "Your location is unavailable. Please check your GPS and try again.";

      }

      else if (
        error.code === 3
      ) {

        message =
          "Location request timed out. Please try again.";

      }


      showLocationError(
        message
      );

    },


    {
      enableHighAccuracy:
        true,

      timeout:
        15000,

      maximumAge:
        0

    }

  );

}


/* =========================================================
   LOCATION ERROR
========================================================= */

function showLocationError(
  message
) {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (!status) {
    return;
  }


  status.className =
    "location-status error";


  status.textContent =
    message;

}


/* =========================================================
   GOOGLE MAP PREVIEW
========================================================= */

function updateMapPreview() {

  const link =
    document.getElementById(
      "googleMapsLink"
    );

  const viewButton =
    document.getElementById(
      "viewLocation"
    );


  if (!link || !viewButton) {
    return;
  }


  const value =
    link.value.trim();


  if (
    isMapsLink(value)
  ) {

    viewButton.href =
      value;


    viewButton.classList.remove(
      "hidden"
    );

  }

  else {

    viewButton.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   PHOTO UPLOAD
========================================================= */

function handlePhotos(event) {

  const files =
    [
      ...event.target.files
    ].filter(
      function (file) {

        return file.type.startsWith(
          "image/"
        );

      }
    );


  const available =
    4 - photos.length;


  if (
    available <= 0
  ) {

    showCustomerMessage(
      "You can add up to 4 photos."
    );

    return;

  }


  photos.push(
    ...files.slice(
      0,
      available
    )
  );


  renderPhotos();


  /*
    Reset input so same file can
    be selected again.
  */

  event.target.value =
    "";

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function renderPhotos() {

  const preview =
    document.getElementById(
      "photoPreview"
    );


  if (!preview) {
    return;
  }


  preview.innerHTML =
    "";


  photos.forEach(
    function (
      file,
      index
    ) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "photo-item";


      const image =
        document.createElement(
          "img"
        );


      image.alt =
        `Bike photo ${index + 1}`;


      image.src =
        URL.createObjectURL(
          file
        );


      const remove =
        document.createElement(
          "button"
        );


      remove.type =
        "button";


      remove.textContent =
        "×";


      remove.setAttribute(
        "aria-label",
        "Remove photo"
      );


      remove.addEventListener(
        "click",
        function () {

          photos.splice(
            index,
            1
          );


          renderPhotos();

        }
      );


      item.appendChild(
        image
      );


      item.appendChild(
        remove
      );


      preview.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   BUILD REVIEW
========================================================= */

function buildReview() {

  const reviewCard =
    document.getElementById(
      "reviewCard"
    );


  if (!reviewCard) {
    return;
  }


  const selectedServices =
    [
      ...document.querySelectorAll(
        'input[name="services"]:checked'
      )
    ]
    .map(
      function (item) {

        return item.value;

      }
    )
    .join(", ");


  const name =
    document.getElementById(
      "customerName"
    ).value.trim();


  const mobile =
    document.getElementById(
      "mobileNumber"
    ).value.trim();


  const brand =
    document.getElementById(
      "bikeBrand"
    ).value.trim();


  const model =
    document.getElementById(
      "bikeModel"
    ).value.trim();


  const registration =
    document.getElementById(
      "registrationNumber"
    ).value.trim();


  const date =
    document.getElementById(
      "pickupDate"
    ).value;


  const time =
    document.getElementById(
      "pickupTime"
    ).value;


  const map =
    document.getElementById(
      "googleMapsLink"
    ).value.trim();


  let formattedDate =
    date;


  if (date) {

    const dateObject =
      new Date(
        `${date}T00:00:00`
      );


    formattedDate =
      dateObject.toLocaleDateString(
        "en-IN",
        {
          day:
            "numeric",

          month:
            "short",

          year:
            "numeric"

        }
      );

  }


  const rows = [

    [
      "Customer",
      name || "—"
    ],

    [
      "Mobile",
      mobile || "—"
    ],

    [
      "Bike",
      `${brand} ${model}`.trim() || "—"
    ],

    [
      "Registration",
      registration || "—"
    ],

    [
      "Services",
      selectedServices || "—"
    ],

    [
      "Pickup Date",
      formattedDate || "—"
    ],

    [
      "Pickup Time",
      time || "—"
    ],

    [
      "Location",
      map
        ? "Google Maps location provided ✓"
        : "—"
    ]

  ];


  reviewCard.innerHTML =
    rows
      .map(
        function (
          [label, value]
        ) {

          return `

            <div class="review-row">

              <span>
                ${escapeHTML(label)}
              </span>

              <strong>
                ${escapeHTML(value)}
              </strong>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(
      /[&<>"']/g,
      function (character) {

        const entities = {

          "&":
            "&amp;",

          "<":
            "&lt;",

          ">":
            "&gt;",

          '"':
            "&quot;",

          "'":
            "&#039;"

        };


        return entities[
          character
        ];

      }
    );

}


/* =========================================================
   COLLECT FORM DATA
========================================================= */

/*
  IMPORTANT:

  There is NO Request ID generated here.

  Apps Script will generate:

  REV-REQ-0001
  REV-REQ-0002
  REV-REQ-0003

  This prevents the browser from becoming
  the source of truth for Request IDs.
*/

function collectFormData() {

  const services =
    [
      ...document.querySelectorAll(
        'input[name="services"]:checked'
      )
    ]
    .map(
      function (item) {

        return item.value;

      }
    );


  return {

    customerName:

      document
        .getElementById(
          "customerName"
        )
        .value
        .trim(),


    mobileNumber:

      document
        .getElementById(
          "mobileNumber"
        )
        .value
        .trim(),


    whatsappNumber:

      document
        .getElementById(
          "whatsappNumber"
        )
        .value
        .trim(),


    email:

      document
        .getElementById(
          "email"
        )
        .value
        .trim(),


    registrationNumber:

      document
        .getElementById(
          "registrationNumber"
        )
        .value
        .trim()
        .toUpperCase(),


    bikeBrand:

      document
        .getElementById(
          "bikeBrand"
        )
        .value
        .trim(),


    bikeModel:

      document
        .getElementById(
          "bikeModel"
        )
        .value
        .trim(),


    services:
      services,


    issueDescription:

      document
        .getElementById(
          "issueDescription"
        )
        .value
        .trim(),


    pickupAddress:

      document
        .getElementById(
          "pickupAddress"
        )
        .value
        .trim(),


    googleMapsLink:

      document
        .getElementById(
          "googleMapsLink"
        )
        .value
        .trim(),


    latitude:

      document
        .getElementById(
          "latitude"
        )
        .value
        .trim(),


    longitude:

      document
        .getElementById(
          "longitude"
        )
        .value
        .trim(),


    pickupDate:

      document
        .getElementById(
          "pickupDate"
        )
        .value,


    pickupTime:

      document
        .getElementById(
          "pickupTime"
        )
        .value,


    consent:

      document
        .getElementById(
          "consent"
        )
        .checked

  };

}


/* =========================================================
   GOOGLE SHEETS SUBMISSION
========================================================= */

/*
  This function sends the booking data
  to your Google Apps Script Web App.

  Apps Script will:

  1. Generate Request ID
  2. Save the booking
  3. Send admin email
  4. Return the Request ID
*/

async function submitToGoogleSheets(
  formData
) {


  /* -------------------------------------------------------
     CHECK CONFIGURATION
  ------------------------------------------------------- */

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL ===
      "YOUR_GOOGLE_APPS_SCRIPT_URL"
  ) {

    /*
      We intentionally stop here.

      This prevents test submissions from
      pretending that they were saved.
    */

    throw new Error(
      "Google Apps Script URL is not configured."
    );

  }


  /* -------------------------------------------------------
     SEND REQUEST
  ------------------------------------------------------- */

  const response =
    await fetch(
      GOOGLE_SCRIPT_URL,
      {

        method:
          "POST",

        /*
          text/plain avoids some browser
          preflight/CORS issues with Apps Script.
        */

        headers:
          {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

        body:
          JSON.stringify(
            formData
          )

      }
    );


  /* -------------------------------------------------------
     HTTP ERROR
  ------------------------------------------------------- */

  if (
    !response.ok
  ) {

    throw new Error(
      "Unable to submit booking."
    );

  }


  /* -------------------------------------------------------
     READ RESPONSE
  ------------------------------------------------------- */

  let result;


  try {

    result =
      await response.json();

  }

  catch {

    throw new Error(
      "Invalid server response."
    );

  }


  /* -------------------------------------------------------
     SERVER ERROR
  ------------------------------------------------------- */

  if (
    !result ||
    result.success !== true
  ) {

    throw new Error(
      "Booking could not be completed."
    );

  }


  /* -------------------------------------------------------
     REQUEST ID IS GENERATED BY APPS SCRIPT
  ------------------------------------------------------- */

  if (
    !result.requestId
  ) {

    throw new Error(
      "Request ID was not returned."
    );

  }


  return result;

}


/* =========================================================
   FINAL FORM SUBMISSION
========================================================= */

async function submitForm(
  event
) {

  event.preventDefault();


  /* -------------------------------------------------------
     DUPLICATE SUBMISSION PROTECTION
  ------------------------------------------------------- */

  if (
    submitting
  ) {

    return;

  }


  /* -------------------------------------------------------
     VALIDATE FINAL STEP
  ------------------------------------------------------- */

  if (
    !validateStep(5)
  ) {

    return;

  }


  /* -------------------------------------------------------
     VALIDATE ALL STEPS AGAIN
  ------------------------------------------------------- */

  for (
    let step = 1;
    step <= 4;
    step++
  ) {

    if (
      !validateStep(step)
    ) {

      showStep(step);

      return;

    }

  }


  /* -------------------------------------------------------
     START SUBMISSION
  ------------------------------------------------------- */

  submitting =
    true;


  setSubmitLoading(
    true
  );


  try {

    /* -----------------------------------------------------
       COLLECT DATA
    ----------------------------------------------------- */

    const formData =
      collectFormData();


    /* -----------------------------------------------------
       SEND TO APPS SCRIPT
    ----------------------------------------------------- */

    const result =
      await submitToGoogleSheets(
        formData
      );


    /*
      Apps Script returns:

      {
        success: true,
        requestId: "REV-REQ-0001"
      }
    */


    const finalRequestId =
      result.requestId;


    /* -----------------------------------------------------
       DISPLAY REAL REQUEST ID
    ----------------------------------------------------- */

    const requestIdDisplay =
      document.getElementById(
        "requestIdDisplay"
      );


    if (
      requestIdDisplay
    ) {

      requestIdDisplay.textContent =
        finalRequestId;

    }


    /* -----------------------------------------------------
       HIDE BOOKING PAGE
    ----------------------------------------------------- */

    const bookingPage =
      document.getElementById(
        "bookingPage"
      );


    if (
      bookingPage
    ) {

      bookingPage.classList.add(
        "hidden"
      );

    }


    /* -----------------------------------------------------
       SHOW SUCCESS SCREEN
    ----------------------------------------------------- */

    if (
      successScreen
    ) {

      successScreen.classList.remove(
        "hidden"
      );

    }


    /* -----------------------------------------------------
       SCROLL TOP
    ----------------------------------------------------- */

    window.scrollTo({

      top:
        0,

      behavior:
        "smooth"

    });


  }

  catch (error) {

    /*
      Technical error is only logged
      for development.

      Customer sees a simple message.
    */

    console.error(
      "REVIGOO submission error:",
      error
    );


    showCustomerMessage(
      "Something went wrong. Please try again."
    );

  }

  finally {

    submitting =
      false;


    setSubmitLoading(
      false
    );

  }

}


/* =========================================================
   SUBMIT BUTTON LOADING
========================================================= */

function setSubmitLoading(
  loading
) {

  if (!submitButton) {
    return;
  }


  submitButton.disabled =
    loading;


  submitButton.classList.toggle(
    "loading",
    loading
  );


  const text =
    submitButton.querySelector(
      ".submit-text"
    );


  if (text) {

    text.textContent =
      loading
        ? "Submitting..."
        : "Request Bike Service";

  }

}


/* =========================================================
   CUSTOMER MESSAGE
========================================================= */

function showCustomerMessage(
  message
) {

  let box =
    document.querySelector(
      ".customer-message"
    );


  if (!box) {

    box =
      document.createElement(
        "div"
      );


    box.className =
      "customer-message";


    Object.assign(
      box.style,
      {

        position:
          "fixed",

        left:
          "50%",

        bottom:
          "22px",

        transform:
          "translateX(-50%)",

        zIndex:
          "9999",

        width:
          "calc(100% - 28px)",

        maxWidth:
          "500px",

        padding:
          "14px 16px",

        borderRadius:
          "12px",

        background:
          "#20242A",

        color:
          "#ffffff",

        textAlign:
          "center",

        fontSize:
          "13px",

        fontWeight:
          "600",

        boxShadow:
          "0 12px 30px rgba(0,0,0,.2)"

      }
    );


    document.body.appendChild(
      box
    );

  }


  box.textContent =
    message;


  clearTimeout(
    box.timer
  );


  box.timer =
    setTimeout(
      function () {

        if (
          box &&
          box.parentNode
        ) {

          box.remove();

        }

      },
      3500
    );

}


/* =========================================================
   END OF REVIGOO SCRIPT
========================================================= */
