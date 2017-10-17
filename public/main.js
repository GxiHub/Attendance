var updateData = function() {
	fetch('http://localhost:8080/update', {
		  method: 'put',
		  headers: {'Content-Type': 'application/json'},
		  body: JSON.stringify({
				'name': 'Fuck',
		  })
	});
};

var deleteData = function() {
	fetch('http://localhost:8080/delete', {
		  method: 'delete',
		  headers: {'Content-Type': 'application/json'},
		  body: JSON.stringify({
				'name': 'jeff',
		  })
	});
};