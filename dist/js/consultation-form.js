(function () {
  "use strict";

  var forms = document.querySelectorAll(".free-consultation-form");
  var minimumFillTime = 1500;
  var submissionCooldown = 30000;
  var storageKey = "mfs-consultation-last-submission";

  function setStatus(status, message, type) {
    status.textContent = message;
    status.className = "free-consultation-status is-visible " + type;
  }

  function getLastSubmissionTime() {
    try {
      return Number(window.localStorage.getItem(storageKey)) || 0;
    } catch (error) {
      return 0;
    }
  }

  function saveSubmissionTime() {
    try {
      window.localStorage.setItem(storageKey, String(Date.now()));
    } catch (error) {
      // The form still works when storage is unavailable.
    }
  }

  function looksSuspicious(form) {
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value;
    var email = form.elements.email.value.trim();
    var combined = name + " " + phone + " " + email;
    var digitCount = phone.replace(/\D/g, "").length;

    return /https?:\/\/|www\.|<[^>]*>|\[url/i.test(combined) || /(.)\1{6,}/i.test(name) || digitCount < 10 || digitCount > 15;
  }

  forms.forEach(function (form) {
    var formOpenedAt = Date.now();

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var submitButton = form.querySelector(".free-consultation-submit");
      var status = form.querySelector(".free-consultation-status");
      var honeyField = form.elements._honey;
      var originalButtonContent = submitButton.innerHTML;
      var ajaxUrl = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

      if (honeyField && honeyField.value) {
        form.reset();
        setStatus(status, "Teşekkürler, talebiniz alındı.", "is-success");
        return;
      }

      if (Date.now() - formOpenedAt < minimumFillTime || looksSuspicious(form)) {
        setStatus(status, "Lütfen girdiğiniz bilgileri kontrol edip tekrar deneyin.", "is-error");
        return;
      }

      if (Date.now() - getLastSubmissionTime() < submissionCooldown) {
        setStatus(status, "Talebiniz az önce gönderildi. Lütfen tekrar göndermeden önce biraz bekleyin.", "is-error");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Gönderiliyor...";
      status.textContent = "";
      status.className = "free-consultation-status";

      try {
        var response = await fetch(ajaxUrl, {
          method: "POST",
          headers: {
            Accept: "application/json"
          },
          body: new FormData(form)
        });
        var result = await response.json();

        if (!response.ok || (result.success !== true && result.success !== "true")) {
          throw new Error(result.message || "Form gönderilemedi.");
        }

        form.reset();
        formOpenedAt = Date.now();
        saveSubmissionTime();
        setStatus(status, "Teşekkürler, talebiniz alındı. En kısa sürede sizi arayacağız.", "is-success");
      } catch (error) {
        setStatus(status, "Talebiniz gönderilemedi. Lütfen biraz sonra tekrar deneyin.", "is-error");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    });
  });
})();
