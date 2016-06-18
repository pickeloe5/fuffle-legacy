function update(id) {
  var form = document.createElement("form");
  form.setAttribute("method", "post");
  form.setAttribute("action", "/update/?id=" + id);

  var field = document.createElement("input");
  field.setAttribute("type", "hidden");
  field.setAttribute("name", "test");
  field.setAttribute("value", document.getElementById("test").value);
  form.appendChild(field);

  document.body.appendChild(form);
  form.submit();
}
