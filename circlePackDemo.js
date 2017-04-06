var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    size = Math.min(width, height);

d3.tsv('http://localhost:8888/orders_2.txt', function(error, data) {
	if (error) throw error;
	console.log(data[0]);

	data.forEach(function(d) {
		d.price = +d.price,
		d.quantity_purchased = +d.quantity_purchased,
		d.cost = +d.cost,
		d.title = d.item_name,
		d.isbn = d.product_id,
		d.condition = d.item_condition,
		d.total_price = +d.quantity_purchased * +d.price,
		d.order_id = d.order_id,
		d.total_profit = +d.quantity_purchased*(+d.price - +d.cost)
	});
	data.sort(function(a,b) {
		return d3.ascending(a.isbn,b.isbn);
	});
	// d3.shuffle(data);
	console.log(data[0]);

	var color = function(condition) {
		if (condition == '11') return "#1582AC";
		if (condition == '1') return "#973252";
		if (condition == '2') return "#FF8A1F";
		if (condition == '3') return "FFE016";
		if (condition == '4') return "lightblue";
		return "grey";
	}

	var conditionMap = {"11": "New",
	                     "1": "Like New",
	                     "2": "Very Good",
	                     "3": "Good",
	                     "4": "Acceptable"}


	circles = d3.packSiblings(data.map(function(d) {
		return {r:Math.sqrt((d.price)*d.quantity_purchased),
	            qty: d.quantity_purchased,
	            condition: d.condition,
	            selected: false,
	            isbn : d.isbn,
	            cost: d.cost,
	            price: d.price,
	            title: d.title,
	            profit: (d.price - d.cost)*d.quantity_purchased,
	            total_price: d.total_price};}));

	var min_width = 0,
	    max_width = 0,
	    min_height = 0,
	    max_height = 0

	var totalProfit = 0,
	    totalPrice = 0;
	circles.forEach(function(d) {
		if (d.x - d.r < min_width) min_width = d.x - d.r;
		if (d.x + d.r > max_width) max_width = d.x + d.r;
		if (d.y - d.r < min_height) min_height = d.y - d.r;
		if (d.y + d.r > max_height) max_height = d.y + d.r;
		totalProfit += d.profit;
		totalPrice += d.total_price;
	})
	d3.select('#totalRevenue').html('$' + totalPrice.toFixed(2));
	d3.select('#totalProfit').html('$' + totalProfit.toFixed(2));

	var packWidth = max_width - min_width,
	    packHeight = max_height - min_height,
	    packSize = Math.min(packWidth, packHeight);

	console.log(packWidth, packHeight);
	console.log(size);
	console.log(0.9*size/packSize);

	if (Math.abs(packSize - size) > 0.1*size) {
		circles.forEach(function(d) {
			d.x *= 0.8*size/packSize;
			d.y *= 0.8*size/packSize;
			d.r *= 0.8*size/packSize;
		})
	}

	// if (packSize < 0.9*size) {
	// 	circles.forEach(function(d) {
	// 		d.x *= packSize/ (0.9*size);
	// 		d.y *= packSize/ (0.9*size);
	// 		d.r *= packSize/ (0.9*size);
	// 	})
	// }

	var circleSelect = function(d) {
		d3.selectAll('circle')
		  .style('stroke-width','0px')
		  .attr('selected', false);
		circles.forEach(function(d){
			d.selected = false;
		});

		d3.select(this)
		  .style('stroke-width', '2px')
		  .style('stroke', 'white')
		  .attr('selected', true);
		d.selected = true;

		d3.select("#isbn").html(d.isbn);
		d3.select("#title").html(d.title);
		d3.select("#qty").html(d.qty);
		d3.select("#price").html('$' + d.price.toFixed(2));
		d3.select("#cost").html('$' + d.cost.toFixed(2));
		d3.select("#totalPrice").html('$' + d.total_price.toFixed(2));
		d3.select("#profit").html('$' + d.profit.toFixed(2));
		d3.select("#condition").html(conditionMap[d.condition]);
	}

	var circleHover = function(d) {

		d3.select(this)
		  .style('stroke-width', '2px')
		  .style('stroke', 'white')
	}

	svg.select("g")
	    .selectAll("circle")
	    .data(circles)
	    .enter().append("circle")
	      .attr('r', function(d) { return Math.max(0.1, d.r - 1);})
	      .attr('cx', function(d) {return d.x;})
	      .attr('cy', function(d) {return d.y;})
	      .attr('selected', false)
	      .style('fill',function(d){return color(d.condition)})
	      .on('click', circleSelect)
	      .on('mouseover', circleHover)
	      .on('mouseout', function(d) {
	      		// console.log(d.selected)
	      		if (d.selected == false){
					d3.select(this)
			  		  .style('stroke-width', '0px')
	      		}
	  		});
	})