const data = userProjects;

const search = document.getElementById("search");
let search_term = "";

const showList = () => {
  const newData = data.filter((item) => {
    return (
      item.name.toLowerCase().includes(search_term) ||
      item.client.name.toLowerCase().includes(search_term)
    );
  });
  renderProjects(newData);
};

search.addEventListener("input", (event) => {
  search_term = event.target.value.toLowerCase();
  showList();
});
