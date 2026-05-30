import Link from "next/link";
import "./contact.css";

interface BreadcrumbProps {
  pageName: string;
}

const ContactBreadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="breadcrumb-container">
      <h2 className="breadcrumb-title">
        {pageName}
      </h2>

      <nav className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          <li className="breadcrumb-item">
            <Link href="/admin/dashboard">
              Dashboard /
            </Link>
          </li>
          <li className="breadcrumb-item-current">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default ContactBreadcrumb;
