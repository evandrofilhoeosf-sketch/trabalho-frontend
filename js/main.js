document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Evita o recarregamento padrão da página

            // Captura os valores digitados
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (name && email && message) {
                alert(`Obrigado, ${name}! Sua mensagem foi enviada com sucesso. Em breve entraremos em contato.`);
                contactForm.reset(); // Limpa o formulário
            } else {
                alert("Por favor, preencha todos os campos antes de enviar.");
            }
        });
    }
});