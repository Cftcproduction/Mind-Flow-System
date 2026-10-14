(function () {
  "use strict";

  var forms = document.querySelectorAll(".free-consultation-form");

  forms.forEach(function (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var submitButton = form.querySelector(".free-consultation-submit");
      var status = form.querySelector(".free-consultation-status");
      var originalButtonContent = submitButton.innerHTML;
      var ajaxUrl = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");

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
        status.textContent = "Teşekkürler, talebiniz alındı. En kısa sürede sizi arayacağız.";
        status.className = "free-consultation-status is-visible is-success";
      } catch (error) {
        status.textContent = "Talebiniz gönderilemedi. Lütfen biraz sonra tekrar deneyin.";
        status.className = "free-consultation-status is-visible is-error";
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    });
  });
})();
