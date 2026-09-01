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
    "https://script.google.com/macros/s/XXXXXXXX/exec";

*/

const GOOGLE_SCRIPT_URL =
  "YOUR_GOOGLE_APPS_SCRIPT_URL";


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


const stepNames = [
  "Customer",
  "Bike",
  "Service",
  "Pickup",
  "Confirm"
];


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


function initializeApp() {

  /*
    Prevent customers from selecting
    a previous pickup date.
  */

  setMinimumPickupDate();


  /*
    Registration number automatically
    becomes uppercase.
  */

  const registration =
    document.getElementById(
      "registrationNumber"
    );

  registration.addEventListener(
    "input",
    function () {

      this.value =
        this.value
          .toUpperCase();

    }
  );


  /*
    Mobile number validation.
  */

  const mobileFields = [
    "mobileNumber",
    "whatsappNumber"
  ];


  mobileFields.forEach(
    function (id) {

      const input =
        document.getElementById(id);

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


  /*
    Current location.
  */

  document
    .getElementById("useCurrentLocation")
    .addEventListener(
      "click",
      getCurrentLocation
    );


  /*
    Google Maps link.
  */

  document
    .getElementById("googleMapsLink")
    .addEventListener(
      "input",
      updateMapPreview
    );


  /*
    Photo upload.
  */

  document
    .getElementById("bikePhotos")
    .addEventListener(
      "change",
      handlePhotos
    );


  /*
    Continue button.
  */

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


      if (currentStep === 4) {

        buildReview();

      }


      if (currentStep < 5) {

        showStep(
          currentStep + 1
        );

      }

    }
  );


  /*
    Back button.
  */

  backButton.addEventListener(
    "click",
    function () {

      if (currentStep > 1) {

        showStep(
          currentStep - 1
        );

      }

    }
  );


  /*
    Step buttons.
  */

  stepButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const target =
            Number(
              this.dataset.step
            );


          /*
            Do not allow skipping
            incomplete sections.
          */

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


  /*
    Final form submission.
  */

  form.addEventListener(
    "submit",
    submitForm
  );


  /*
    Start at Step 1.
  */

  showStep(1);

}


/* =========================================================
   STEP NAVIGATION
========================================================= */

function showStep(step) {

  currentStep = step;


  /*
    Show correct panel.
  */

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


  /*
    Update step indicators.
  */

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


  /*
    Update progress bar.
  */

  progressFill.style.width =
    `${step * 20}%`;


  /*
    Update text.
  */

  stepLabel.textContent =
    `Step ${step} of 5`;

  stepTitle.textContent =
    stepNames[step - 1];


  /*
    Back button.
  */

  backButton.classList.toggle(
    "hidden",
    step === 1
  );


  /*
    Continue button.
  */

  nextButton.classList.toggle(
    "hidden",
    step === 5
  );


  /*
    Submit button.
  */

  submitButton.classList.toggle(
    "hidden",
    step !== 5
  );


  /*
    Build review screen.
  */

  if (step === 5) {

    buildReview();

  }


  /*
    Scroll back to booking section.
  */

  const booking =
    document.getElementById(
      "booking"
    );

  window.scrollTo({

    top:
      booking.offsetTop - 10,

    behavior:
      "smooth"

  });

}


/* =========================================================
   VALIDATE PREVIOUS STEPS
========================================================= */

function validateStepsBefore(target) {

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
   STEP VALIDATION
========================================================= */

function validateStep(step) {

  clearErrors();


  /* -------------------------------------------------------
     CUSTOMER
  ------------------------------------------------------- */

  if (step === 1) {

    let valid = true;


    const name =
      document.getElementById(
        "customerName"
      );

    const mobile =
      document.getElementById(
        "mobileNumber"
      );

    const email =
      document.getElementById(
        "email"
      );


    /*
      Name.
    */

    if (
      !name.value.trim()
    ) {

      fieldError(
        name,
        "Please enter your name."
      );

      valid = false;

    }


    /*
      Indian mobile number.
    */

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


    /*
      Email only if entered.
    */

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


  /* -------------------------------------------------------
     BIKE
  ------------------------------------------------------- */

  if (step === 2) {

    let valid = true;


    const requiredBikeFields = [
      "registrationNumber",
      "bikeBrand",
      "bikeModel"
    ];


    requiredBikeFields.forEach(
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


    /*
      Manufacturing year.
    */

    const year =
      document.getElementById(
        "manufacturingYear"
      );


    if (year.value) {

      const currentYear =
        new Date().getFullYear();

      const selectedYear =
        Number(year.value);


      if (
        selectedYear < 1950 ||
        selectedYear > currentYear
      ) {

        fieldError(
          year,
          "Please enter a valid manufacturing year."
        );

        valid = false;

      }

    }


    /*
      Odometer.
    */

    const odometer =
      document.getElementById(
        "odometer"
      );


    if (
      odometer.value &&
      Number(odometer.value) < 0
    ) {

      fieldError(
        odometer,
        "Please enter a valid odometer reading."
      );

      valid = false;

    }


    return valid;

  }


  /* -------------------------------------------------------
     SERVICE
  ------------------------------------------------------- */

  if (step === 3) {

    const selectedServices =
      document.querySelectorAll(
        'input[name="services"]:checked'
      );


    if (
      selectedServices.length === 0
    ) {

      document.getElementById(
        "serviceError"
      ).textContent =
        "Please select at least one service.";


      return false;

    }


    return true;

  }


  /* -------------------------------------------------------
     PICKUP
  ------------------------------------------------------- */

  if (step === 4) {

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


    /*
      Address.
    */

    if (
      !address.value.trim()
    ) {

      fieldError(
        address,
        "Please enter your pickup address."
      );

      valid = false;

    }


    /*
      Google Maps link is REQUIRED.
    */

    if (
      !mapsLink.value.trim()
    ) {

      fieldError(
        mapsLink,
        "Please provide your Google Maps location."
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
        "Please enter a valid Google Maps link."
      );

      valid = false;

    }


    /*
      Pickup date.
    */

    if (
      !pickupDate.value
    ) {

      fieldError(
        pickupDate,
        "Please select a pickup date."
      );

      valid = false;

    }


    /*
      Pickup time.
    */

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


  /* -------------------------------------------------------
     CONFIRMATION
  ------------------------------------------------------- */

  if (step === 5) {

    const consent =
      document.getElementById(
        "consent"
      );


    if (
      !consent.checked
    ) {

      document.getElementById(
        "consentError"
      ).textContent =
        "Please agree before submitting.";

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
      field =>
        field.classList.remove(
          "invalid"
        )
    );


  document
    .querySelectorAll(
      ".error"
    )
    .forEach(
      error =>
        error.textContent = ""
    );


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


    return (

      hostname.includes(
        "google.com"
      ) &&

      (
        url.pathname.includes(
          "/maps"
        ) ||
        hostname.includes(
          "maps.google"
        )
      )

    ) ||

    hostname ===
      "goo.gl";


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


  /*
    Browser doesn't support GPS.
  */

  if (
    !navigator.geolocation
  ) {

    showLocationError(
      "Location is not supported on this device."
    );

    return;

  }


  /*
    Loading state.
  */

  button.disabled =
    true;

  button.textContent =
    "◎ Finding your location...";


  status.className =
    "location-status";


  status.textContent =
    "Please allow location access when your browser asks.";


  /*
    Request location.
  */

  navigator.geolocation.getCurrentPosition(

    function (position) {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;


      /*
        Google Maps URL.

        Example:

        https://www.google.com/maps?q=10.123456,76.123456
      */

      const mapsURL =
        `https://www.google.com/maps?q=${lat},${lng}`;


      /*
        Store technical coordinates.
      */

      document.getElementById(
        "latitude"
      ).value =
        lat.toFixed(6);


      document.getElementById(
        "longitude"
      ).value =
        lng.toFixed(6);


      /*
        Automatically fill Maps link.
      */

      document.getElementById(
        "googleMapsLink"
      ).value =
        mapsURL;


      /*
        Success message.
      */

      status.className =
        "location-status success";


      status.textContent =
        "✓ Location captured and Google Maps link added.";


      /*
        Restore button.
      */

      button.disabled =
        false;


      button.textContent =
        "✓ Location Captured";


      /*
        Show View on Maps button.
      */

      updateMapPreview();


      /*
        Restore button text after a moment.
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
          "Your location is unavailable. Please check GPS and try again.";

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
      file =>
        file.type.startsWith(
          "image/"
        )
    );


  /*
    Maximum 4 photos.
  */

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
    Allow selecting the
    same file again later.
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


  preview.innerHTML =
    "";


  photos.forEach(
    function (file, index) {

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

  const selectedServices =
    [
      ...document.querySelectorAll(
        'input[name="services"]:checked'
      )
    ]
    .map(
      item =>
        item.value
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


  /*
    Format date for customer.
  */

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


  const reviewCard =
    document.getElementById(
      "reviewCard"
    );


  reviewCard.innerHTML =
    rows
      .map(
        function ([label, value]) {

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
   REQUEST ID
========================================================= */

function generateRequestId() {

  const number =
    Math.floor(
      100000 +
      Math.random() *
      900000
    );


  return `REV-REQ-${number}`;

}


/* =========================================================
   COLLECT FORM DATA
========================================================= */

function collectFormData(
  requestId
) {

  const services =
    [
      ...document.querySelectorAll(
        'input[name="services"]:checked'
      )
    ]
    .map(
      item =>
        item.value
    );


  return {

    timestamp:
      new Date().toISOString(),

    requestId:

      requestId,

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

    manufacturingYear:

      document
        .getElementById(
          "manufacturingYear"
        )
        .value
        .trim(),

    odometer:

      document
        .getElementById(
          "odometer"
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
        .checked,

    status:
      "New",

    assignedGarage:
      "",

    createdBy:
      "Customer Website"

  };

}


/* =========================================================
   GOOGLE SHEETS SUBMISSION
========================================================= */

/*
  This function is intentionally separated from
  the rest of the application.

  Later, replace:

  YOUR_GOOGLE_APPS_SCRIPT_URL

  with your Google Apps Script Web App URL.
*/

async function submitToGoogleSheets(
  formData
) {


  /*
    DEVELOPMENT MODE

    If the URL has not been added yet,
    don't send anything to the internet.

    The form can still be tested locally.
  */

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL ===
      "YOUR_GOOGLE_APPS_SCRIPT_URL"
  ) {

    console.log(
      "REVIGOO development submission:",
      formData
    );


    /*
      Simulate a short request.
    */

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          700
        )
    );


    return {

      success:
        true,

      developmentMode:
        true

    };

  }


  /*
    SEND TO GOOGLE APPS SCRIPT
  */

  const response =
    await fetch(
      GOOGLE_SCRIPT_URL,
      {

        method:
          "POST",

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


  /*
    Network/API failure.
  */

  if (
    !response.ok
  ) {

    throw new Error(
      "Submission failed"
    );

  }


  /*
    Try reading response.
  */

  try {

    return await response.json();

  }

  catch {

    return {
      success:
        true
    };

  }

}


/* =========================================================
   FINAL SUBMISSION
========================================================= */

async function submitForm(
  event
) {

  event.preventDefault();


  /*
    Prevent duplicate submission.
  */

  if (
    submitting
  ) {

    return;

  }


  /*
    Validate confirmation.
  */

  if (
    !validateStep(5)
  ) {

    return;

  }


  submitting =
    true;


  /*
    Loading state.
  */

  submitButton.disabled =
    true;


  submitButton.classList.add(
    "loading"
  );


  try {

    /*
      Generate temporary Request ID.
    */

    const requestId =
      generateRequestId();


    /*
      Collect all form data.
    */

    const formData =
      collectFormData(
        requestId
      );


    /*
      Send data.
    */

    await submitToGoogleSheets(
      formData
    );


    /*
      Show success screen.
    */

    document.getElementById(
      "requestIdDisplay"
    ).textContent =
      requestId;


    document.getElementById(
      "booking"
    ).classList.add(
      "hidden"
    );


    successScreen.classList.remove(
      "hidden"
    );


    /*
      Go to top.
    */

    window.scrollTo({

      top:
        0,

      behavior:
        "smooth"

    });

  }

  catch (error) {

    /*
      Technical error is NOT
      shown to the customer.
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


    submitButton.disabled =
      false;


    submitButton.classList.remove(
      "loading"
    );

  }

}


/* =========================================================
   CUSTOMER-FRIENDLY MESSAGE
========================================================= */

function showCustomerMessage(
  message
) {

  /*
    Reuse existing message box
    if one already exists.
  */

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
          "13px 16px",

        borderRadius:
          "12px",

        background:
          "#20242a",

        color:
          "#ffffff",

        textAlign:
          "center",

        fontSize:
          "12px",

        fontWeight:
          "650",

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

        box.remove();

      },
      3500
    );

}


/* =========================================================
   END
========================================================= */
