import { useState, useEffect } from "react";
import { useStore } from "../services/store";
import { Link } from "react-router-dom";
import { ContentfulService } from "../services/api";
import "./Logo.css";
import ScrollLink from "./ScrollLink";

function Logo({ inverted = false }) {
  const [logo, setLogo] = useState(null);
  const { setLoading } = useStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const logoContent = await ContentfulService.fetchContent("Logo");
      setLogo(logoContent);
      setLoading(false);
    };
    load();
  }, [setLoading]);

  return (
    <ScrollLink to="/" className="logo">
      {logo && (
        <img
          src={logo.image}
          alt={logo.label}
          className="logo-img"
          style={inverted ? { filter: "brightness(0.2) invert(1)" } : {}}
        />
      )}
    </ScrollLink>
  );
}

export default Logo;
