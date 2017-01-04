var CodingChallange = (function(){

	var inputFilePath = "challenges/input_hard.txt";

	var nodeCount = 0;
	var nodeArray = [];

	var queryCount = 0;
	var queryArray = [];

	var result = [];
	var tree = {};

	function Node(parent, depth) {
		this.parent = parent;
		this.value = 0;
		this.depth = depth;
		this.children = [];
	}

	// Constructor, sets base node
	function CodingChallange(){
		tree['1'] = new Node(null,0);
	};

	// Gets input data and calls other methods to build tree
	CodingChallange.prototype.getData = function(){

		var _this = this;
		$.ajax({
			url: inputFilePath
			,type: "GET"
			,async : false
			,success:function (data){
				_this.setData(data);
				_this.setTreeNodes();
			}
		});
	}

	// Assigns input data values to object private variables
	CodingChallange.prototype.setData = function(data){

		var tempData = data.trim().split("\n");

		nodeCount = parseInt(tempData[0])-1;
		nodeArray = tempData.splice(1, nodeCount ).map(function(e){return e.trim().split(" ")});

		queryCount =  parseInt(tempData[1]);
		queryArray =  tempData.splice(2).map(function(e){return e.trim().split(" ")});

	}

	// Builds tree
	CodingChallange.prototype.setTreeNodes = function(){

		var parentKeyList = ['1']; 	// temporary stores parent keys, helps to match children nodes
		var go = true; 				// used to keep the loop going until all nodes are set

		while(go){
			var childKeyList = []; 	// temporary children list, which gets assigned to parrent list each cycle
			go = false;

			// Looping through all nodes
			for(var i = 0, j = nodeArray.length; i<j;i++){

				// Checks if unassigned node has a parent in tree
				if(parentKeyList.indexOf(nodeArray[i][0]) > -1 || parentKeyList.indexOf(nodeArray[i][1]) > -1){

					go = true;
					var parentKey;
					var childKey;

					// Gets unassigned node parent and children
					if(parentKeyList.indexOf(nodeArray[i][0]) > -1){
						parentKey = nodeArray[i][0];
						childKey  = nodeArray[i][1];
					}else{
						parentKey = nodeArray[i][1];
						childKey  = nodeArray[i][0];
					}

					// Adds children to the parent children list
					tree[parentKey].children.push(childKey);

					// Builds tree node
					tree[childKey] = new Node(parentKey,tree[parentKey].depth+1);

					// Adds child to list, helps to match child children in next cycle
					childKeyList.push(childKey);

					// Removes node from nodeArray
					nodeArray.splice(i,1);

					// Adjusts loop after removing node from the nodeArray
					i--;
					j--;

				}

			}
			// Childrens grow up to be parents
			parentKeyList = childKeyList;
		}
	}

	// Runs all querries
	CodingChallange.prototype.runQueries = function(){

		for(var i = 0; i < queryCount; i++){
			var el1 = parseInt(queryArray[i][1]); // Gets first function variable
			var el2 = parseInt(queryArray[i][2]); // Gets second function variable

			// Switch for functions add and max
			if(queryArray[i][0] == "add"){
				this.add(el1,el2);
			}
			else{
				// Checks if nodes are in the tree
				if(typeof tree[el1] != 'undefined' && typeof tree[el2] != 'undefined'){
					this.max(el1,el2);
				}else{
					result.push(0);
				}
			}
		}
	}

	// Adds value to all nodes in subtree rooted at nodeKey
	CodingChallange.prototype.add = function(nodeKey, value){
		if(typeof tree[nodeKey] != 'undefined'){
			var temp = tree[nodeKey].children;
			tree[nodeKey].value+=value;

			for(var i = 0, j=temp.length ; i<j;i++){
				this.add(temp[i],value);
			}
		}
	}

	// Reports maximum value on the path from a to b
	CodingChallange.prototype.max = function(node1,node2,max){

		// Handles max value checking between nodes
		if(typeof max == 'undefined'){
			max = (tree[node1].value > tree[node2].value) ? tree[node1].value : tree[node2].value
		}else{
			if (tree[node1].value > max)
				max = tree[node1].value
		}

		// Checks if nodes path found
		if(tree[node1].parent == node2 || tree[node2].parent == node1){
			result.push(max);
			return ;
		}

		// Checks depth between nodes
		if( tree[node1].depth > tree[node2].depth ){
			this.max(tree[node1].parent,node2,max);
		}else{
			this.max(tree[node2].parent,node1,max);
		}
	}

	// Creates a link to output results
	CodingChallange.prototype.showResult = function(){
		var output = result.join("\n");

		var blob = new Blob([output], {type : 'text/plain'});
		var url = URL.createObjectURL(blob);

		$("body").append("<a href=\""+url+"\" download=\"Output.txt\">Output</a>");
	}


	return CodingChallange;

})();


$(document).ready(function(){


	var start = performance.now();

	var codingChallange = new CodingChallange(); // Init object
	codingChallange.getData();		// Gets data and sets tree
	codingChallange.runQueries();	// Runs through queries
	codingChallange.showResult();	// Outputs results

	var end = performance.now();
	console.log('Processed in: '+ (end - start) + "ms.");
});
