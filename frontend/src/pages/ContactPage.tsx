export default function ContactPage() {
  return (
    <div className="page simple-page">
      <h1>Contact</h1>
      <p>Nous sommes ravis de vous répondre.</p>
      <form className="contact-form">
        <label>
          Nom
          <input type="text" placeholder="Votre nom" />
        </label>
        <label>
          Email
          <input type="email" placeholder="votre@email.com" />
        </label>
        <label>
          Message
          <textarea rows={5} placeholder="Votre message..." />
        </label>
        <button type="submit" className="btn btn-primary">
          Envoyer
        </button>
      </form>
    </div>
  );
}
