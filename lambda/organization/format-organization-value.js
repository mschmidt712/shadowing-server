
export default function formatOrganizationValue (org) {
  return org.name.toLowerCase().replace(/ /g, '-');
}