import { services } from "../data/services";
import "./HeroServices.css";

export function HeroServices() {
  return (
    <ul className="services">
      {services.map((service) => (
        <li className="service" key={service.index}>
          <span className="service-index">{service.index}</span>
          <p className="service-name">{service.title}</p>
          <p className="service-text">{service.text}</p>
        </li>
      ))}
    </ul>
  );
}
