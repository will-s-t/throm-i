// config
var f = d3.format(".1f");
const minX = 0
const maxX = 409.0255
const vteColour = "#4081B3"
const vteColourLight = "#B6C8E1"
const bleedColour = "#C12118"
const bleedColourLight = "#E6A6A3"

var selectedData = 1
var riskFactors = 0
var linksPaneVisible = false;

// guidance links

d3.select("#linksButton")
	.on("click", function(){
		if(linksPaneVisible == false) {
			linksPaneVisible = true;
			d3.select("#linksMask")
				.attr("display", null);
			d3.select("#linksPane")
				.attr("display", null);
		} else {
			linksPaneVisible = false;
			d3.select("#linksMask")
				.attr("display", "none");
			d3.select("#linksPane")
				.attr("display", "none");
		}
		
	});

d3.select("#linksCloseButton")
	.on("click", function(){
		linksPaneVisible = false;
		d3.select("#linksMask")
			.attr("display", "none");
		d3.select("#linksPane")
			.attr("display", "none");
		});

d3.select("#linksMask")
	.on("click", function(){
		linksPaneVisible = false;
		d3.select("#linksMask")
			.attr("display", "none");
		d3.select("#linksPane")
			.attr("display", "none");
		});





// load in data

Promise.all([
    	d3.csv("surgery-types.csv"),
    	d3.csv("data1-abdominal.csv"),
    	d3.csv("data2-colorectal.csv"),
    	d3.csv("data3-upperGI.csv"),
    	d3.csv("data4-gynae-cancer.csv"),
    	d3.csv("data5-gynae-non-cancer.csv"),
    	d3.csv("data6-urol-cancer.csv"),
    	d3.csv("data7-urol-non-cancer.csv")
	]).then(function(files) {

	data0surgeryTypes = files[0]
	data1 = files[1]
	data2 = files[2]
	data3 = files[3]
	data4 = files[4]
	data5 = files[5]
	data6 = files[6]
	data7 = files[7]

	// make dropdown to select surgery type

	var dropdown = d3.select("#surgeryTypeDropdown")
		.on("change", function(){
			selectedData = document.getElementById("surgeryTypeDropdown").value

			updateProcedureDropdown(files[selectedData])

		})

	dropdown.selectAll("option")
		.data(data0surgeryTypes)
		.enter()
		.append("option")
		.attr("value", function(d, i){
			return i+1
		})
		.text(function(d){
			var titleText = d["type"]
			return titleText
		})

	// update procedure dropdown

	updateProcedureDropdown(files[selectedData])

	// VTE risk factor buttons

	d3.select("#VTEbutton0")
		.on("click", function(){
			d3.select("#VTEbutton0ring")
				.attr("display", null)
			d3.select("#VTEbutton1ring")
				.attr("display", "none")
			d3.select("#VTEbutton2ring")
				.attr("display", "none")
			riskFactors = 0
			var selectedProcedure = document.getElementById("procedureDropdown").value
			var selectedMethod = document.getElementById("methodDropdown").value
			d3.select("#resultsDisplay").attr("display", null)
			d3.select("#riskFactorHighlight").attr("display", "none")
			displayGraph(files[selectedData], selectedProcedure, selectedMethod)
		})

	d3.select("#VTEbutton1")
		.on("click", function(){
			d3.select("#VTEbutton0ring")
				.attr("display", "none")
			d3.select("#VTEbutton1ring")
				.attr("display", null)
			d3.select("#VTEbutton2ring")
				.attr("display", "none")
			riskFactors = 1
			var selectedProcedure = document.getElementById("procedureDropdown").value
			var selectedMethod = document.getElementById("methodDropdown").value
			d3.select("#resultsDisplay").attr("display", null)
			d3.select("#riskFactorHighlight").attr("display", "none")
			displayGraph(files[selectedData], selectedProcedure, selectedMethod)
		})

	d3.select("#VTEbutton2")
		.on("click", function(){
			d3.select("#VTEbutton0ring")
				.attr("display", "none")
			d3.select("#VTEbutton1ring")
				.attr("display", "none")
			d3.select("#VTEbutton2ring")
				.attr("display", null)
			riskFactors = 2
			var selectedProcedure = document.getElementById("procedureDropdown").value
			var selectedMethod = document.getElementById("methodDropdown").value
			d3.select("#resultsDisplay").attr("display", null)
			d3.select("#riskFactorHighlight").attr("display", "none")
			displayGraph(files[selectedData], selectedProcedure, selectedMethod)
		})


});

function updateProcedureDropdown(data) {

	// make a list of unique procedure names

	var procedures = []

	for (var i = 0; i < data.length; i++) {
		var procedureExists = false
		for (var j = 0; j < procedures.length; j++) {
			if(procedures[j] == data[i]["Procedure"]) {
				procedureExists = true
			}
		}
		if(procedureExists == false) {
			procedures.push(data[i]["Procedure"])
		}
		
	}

	// update dropdown with procedure names

	
	var dropdown = d3.select("#procedureDropdown")

	dropdown.selectAll("option").remove()

	dropdown.selectAll("option")
		.data(procedures)
		.enter()
		.append("option")
		.attr("value", function(d, i){
			return procedures[i]
		})
		.text(function(d, i){
			var titleText = procedures[i]
			return titleText
		})



	dropdown.on("change", function(){
		var selectedProcedure = document.getElementById("procedureDropdown").value
		updateMethodDropdown(data, selectedProcedure)

	})

	// update method dropdown

	var selectedProcedure = procedures[0]
	updateMethodDropdown(data, selectedProcedure)

}

function updateMethodDropdown(data, selectedProcedure) {

	// make a list of method names that appy to the selected procedure

	var methods = []

	for (var i = 0; i < data.length; i++) {
		if(data[i]["Procedure"]==selectedProcedure) {
			methods.push(data[i]["Method"])
		}
		
	}

	// update dropdown with method names

	
	var dropdown = d3.select("#methodDropdown")

	dropdown.selectAll("option").remove()

	dropdown.selectAll("option")
		.data(methods)
		.enter()
		.append("option")
		.attr("value", function(d, i){
			return methods[i]
		})
		.text(function(d, i){
			var titleText = methods[i]
			return titleText
		})

	var initialMethodSelected = document.getElementById("methodDropdown").value
	updateFootnotes(selectedProcedure, initialMethodSelected)


	dropdown.on("change", function(){
		var selectedMethod = document.getElementById("methodDropdown").value
		displayGraph(data, selectedProcedure, selectedMethod)
		updateFootnotes(selectedProcedure, selectedMethod)

		// show footnotes if needed

		// lymphadenectomyLaparoscopic
		// lymphadenectomy
		// nonAsian
		
	})

	displayGraph(data, selectedProcedure, methods[0])

}

function updateFootnotes(selectedProcedure, selectedMethod){
	d3.selectAll(".footnote").attr("display", "none")

	if(selectedProcedure == "Gastrectomy" && selectedMethod == "minimally-invasive*" || selectedProcedure == "Gastrectomy" && selectedMethod == "open*") {
		d3.select("#nonAsian").attr("display", null)
	}

	if(selectedProcedure == "Radical trachelectomy" && selectedMethod == "vaginal*") {
		d3.select("#lymphadenectomyLaparoscopic").attr("display", null)
	}

	if(selectedProcedure == "Radical prostatectomy") {
		d3.select("#PLND").attr("display", null)
	}

	if(selectedProcedure == "Vulvectomy for cancer*") {
		d3.select("#vulvectomy").attr("display", null)
	}

}

function displayGraph(data, selectedProcedure, selectedMethod) {

	var vteRiskWith, vteRiskWithout, bleedReinterventionRiskWith, bleedReinterventionRiskWithout, bleedTransfusionRiskWith, bleedTransfusionRiskWithout, vteCertainty, bleedReinterventionCertainty, bleedTransfusionCertainty

	for (var i = 0; i < data.length; i++) {
		if(data[i]["Procedure"] == selectedProcedure && data[i]["Method"] == selectedMethod) {
			if(riskFactors == 0) {
				vteRiskWith = data[i]["LOW VTE risk with thromboprophylaxis"]
				vteRiskWithout = data[i]["LOW VTE risk without thromboprophylaxis"]
			} else if(riskFactors == 1) {
				vteRiskWith = data[i]["MEDIUM VTE risk with thromboprophylaxis"]
				vteRiskWithout = data[i]["MEDIUM VTE risk without thromboprophylaxis"]
			} else if(riskFactors == 2) {
				vteRiskWith = data[i]["HIGH VTE risk with thromboprophylaxis"]
				vteRiskWithout = data[i]["HIGH VTE risk without thromboprophylaxis"]
			}
			
			bleedReinterventionRiskWith = data[i]["Bleeding requiring reintervention with thromboprophylaxis"]
			bleedReinterventionRiskWithout = data[i]["Bleeding requiring reintervention without thromboprophylaxis"]
			bleedTransfusionRiskWith = data[i]["Bleeding leading to transfusion with thromboprophylaxis"]
			bleedTransfusionRiskWithout = data[i]["Bleeding leading to transfusion without thromboprophylaxis"]
		
			vteCertainty = data[i]["Evidence quality VTE"]
			bleedReinterventionCertainty = data[i]["Evidence quality bleeding requiring reoperation"]
			bleedTransfusionCertainty = data[i]["Evidence quality bleeding leading to transfusion"]

		}
	}


	// create zeroed variabes

	var vteRiskWithZeroed = vteRiskWith
	var vteRiskWithoutZeroed = vteRiskWithout
	var bleedReinterventionRiskWithZeroed = bleedReinterventionRiskWith
	var bleedReinterventionRiskWithoutZeroed = bleedReinterventionRiskWithout
	var bleedTransfusionRiskWithZeroed = bleedTransfusionRiskWith
	var bleedTransfusionRiskWithoutZeroed = bleedTransfusionRiskWithout

	if(vteRiskWith == "<0.1" || vteRiskWith == "NR" || vteRiskWith == "NA" ) {
		vteRiskWithZeroed = 0
	}

	if(vteRiskWithout == "<0.1" || vteRiskWithout == "NR" || vteRiskWithout == "NA") {
		vteRiskWithoutZeroed = 0
	}

	if(bleedReinterventionRiskWith == "<0.1" || bleedReinterventionRiskWith == "NR" || bleedReinterventionRiskWith == "NA") {
		bleedReinterventionRiskWithZeroed = 0
	}

	if(bleedReinterventionRiskWithout == "<0.1" || bleedReinterventionRiskWithout == "NR" || bleedReinterventionRiskWithout == "NA") {
		bleedReinterventionRiskWithoutZeroed = 0
	}

	if(bleedTransfusionRiskWith == "<0.1" || bleedTransfusionRiskWith == "NR" || bleedTransfusionRiskWith == "NA") {
		bleedTransfusionRiskWithZeroed = 0
	}

	if(bleedTransfusionRiskWithout == "<0.1" || bleedTransfusionRiskWithout == "NR" || bleedTransfusionRiskWithout == "NA") {
		bleedTransfusionRiskWithoutZeroed = 0
	}

	var scaleMax = 40

	// find out maximum values

	if(vteRiskWithZeroed < 30 && vteRiskWithoutZeroed < 30 && bleedReinterventionRiskWithZeroed < 30 && bleedReinterventionRiskWithoutZeroed < 30 && bleedTransfusionRiskWithZeroed < 30 && bleedTransfusionRiskWithoutZeroed < 30) {
		scaleMax = 30
	}

	if(vteRiskWithZeroed < 20 && vteRiskWithoutZeroed < 20 && bleedReinterventionRiskWithZeroed < 20 && bleedReinterventionRiskWithoutZeroed < 20 && bleedTransfusionRiskWithZeroed < 20 && bleedTransfusionRiskWithoutZeroed < 20) {
		scaleMax = 20
	}

	if(vteRiskWithZeroed < 10 && vteRiskWithoutZeroed < 10 && bleedReinterventionRiskWithZeroed < 10 && bleedReinterventionRiskWithoutZeroed < 10 && bleedTransfusionRiskWithZeroed < 10 && bleedTransfusionRiskWithoutZeroed < 10) {
		scaleMax = 10
	}


	const riskScale = d3.scaleLinear()
		.domain([0, scaleMax])
		.range([minX, maxX])

	// change scale text labels


	d3.selectAll(".riskScaleText2")
		.text(scaleMax*0.25 + "%")
	d3.selectAll(".riskScaleText3")
		.text(scaleMax*0.5 + "%")
	d3.selectAll(".riskScaleText4")
		.text(scaleMax*0.75 + "%")
	d3.selectAll(".riskScaleText5")
		.text(scaleMax + "%")
	

	// check whether any points overlap, so they can be moved vertically, and hide and show link arrows

	var vteRiskOverlap = false
	var bleedReinterventionRiskOverlap = false
	var bleedTransfusionRiskOverlap = false

	var tooCloseNumber = scaleMax / 13.333333333333333

	d3.select("#vteArrowhead").attr("display", null)
	d3.select("#vteArrowShaft").attr("display", null)
	if(vteRiskWithoutZeroed - vteRiskWithZeroed < tooCloseNumber) {
		vteRiskOverlap = true
		d3.select("#vteArrowhead").attr("display", "none")
		d3.select("#vteArrowShaft").attr("display", "none")
	}

	d3.select("#bleedReinterventionArrowhead").attr("display", null)
	d3.select("#bleedReinterventionArrowShaft").attr("display", null)
	if(bleedReinterventionRiskWithZeroed  - bleedReinterventionRiskWithoutZeroed  < tooCloseNumber) {
		bleedReinterventionRiskOverlap = true
		d3.select("#bleedReinterventionArrowhead").attr("display", "none")
		d3.select("#bleedReinterventionArrowShaft").attr("display", "none")
	}

	d3.select("#bleedTransfusionArrowhead").attr("display", null)
	d3.select("#bleedTransfusionArrowShaft").attr("display", null)
	if(bleedTransfusionRiskWithZeroed  - bleedTransfusionRiskWithoutZeroed < tooCloseNumber) {
		bleedTransfusionRiskOverlap = true
		d3.select("#bleedTransfusionArrowhead").attr("display", "none")
		d3.select("#bleedTransfusionArrowShaft").attr("display", "none")
	}

	// move points

	d3.select("#vteArrowShaft")
		.attr("x1", function(){
			var xPos = riskScale(+vteRiskWith)+112.2886
			console.log(xPos)
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})
		.attr("x2", function(){
			var xPos = riskScale(+vteRiskWithout)+110.2886
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})


	d3.select("#vteRiskWith")
		.attr("transform", function(){
			var xPos = riskScale(+vteRiskWith)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(vteRiskOverlap == true) {
				yPos = -14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(vteRiskWith)

	d3.select("#vteRiskWithout")
		.attr("transform", function(){
			var xPos = riskScale(+vteRiskWithout)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(vteRiskOverlap == true) {
				yPos = 14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(vteRiskWithout)

	d3.select("#vteCertaintytext")
		.text(vteCertainty)

	d3.select("#vteCertaintyStar1")
		.attr("fill", function(){
			if(vteCertainty == "Very low") {
				return "#FFCD44"
			} else if(vteCertainty == "Low") {
				return "#FFCD44"
			} else if(vteCertainty == "Moderate") {
				return "#FFCD44"
			} else if(vteCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#vteCertaintyStar2")
		.attr("fill", function(){
			if(vteCertainty == "Low") {
				return "#FFCD44"
			} else if(vteCertainty == "Moderate") {
				return "#FFCD44"
			} else if(vteCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#vteCertaintyStar3")
		.attr("fill", function(){
			if(vteCertainty == "Moderate") {
				return "#FFCD44"
			} else if(vteCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#vteCertaintyStar4")
		.attr("fill", function(){
			if(vteCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})



	d3.select("#bleedReinterventionArrowShaft")
		.attr("x1", function(){
			var xPos = riskScale(+bleedReinterventionRiskWith)+108.2886
			console.log(xPos)
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})
		.attr("x2", function(){
			var xPos = riskScale(+bleedReinterventionRiskWithout)+110.2886
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})

	d3.select("#bleedReinterventionRiskWith")
		.attr("transform", function(){
			var xPos = riskScale(+bleedReinterventionRiskWith)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(bleedReinterventionRiskOverlap == true) {
				yPos = -14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(bleedReinterventionRiskWith)

	d3.select("#bleedReinterventionRiskWithout")
		.attr("transform", function(){
			var xPos = riskScale(+bleedReinterventionRiskWithout)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(bleedReinterventionRiskOverlap == true) {
				yPos = 14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(bleedReinterventionRiskWithout)

	d3.select("#bleedReinterventionCertaintyText")
		.text(bleedReinterventionCertainty)

	d3.select("#bleedReinterventionCertaintyStar1")
		.attr("fill", function(){
			if(bleedReinterventionCertainty == "Very low") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "Low") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedReinterventionCertaintyStar2")
		.attr("fill", function(){
			if(bleedReinterventionCertainty == "Low") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedReinterventionCertaintyStar3")
		.attr("fill", function(){
			if(bleedReinterventionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedReinterventionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedReinterventionCertaintyStar4")
		.attr("fill", function(){
			if(bleedReinterventionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	

	d3.select("#bleedTransfusionArrowShaft")
		.attr("x1", function(){
			var xPos = riskScale(+bleedTransfusionRiskWith)+108.2886
			console.log(xPos)
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})
		.attr("x2", function(){
			var xPos = riskScale(+bleedTransfusionRiskWithout)+110.2886
			if(xPos == undefined) {
				xPos = 0
			}
			return xPos
		})

	d3.select("#bleedTransfusionRiskWith")
		.attr("transform", function(){
			var xPos = riskScale(+bleedTransfusionRiskWith)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(bleedTransfusionRiskOverlap == true) {
				yPos = -14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(bleedTransfusionRiskWith)

	d3.select("#bleedTransfusionRiskWithout")
		.attr("transform", function(){
			var xPos = riskScale(+bleedTransfusionRiskWithout)
			if(xPos == undefined) {
				xPos = 0
			}
			var yPos = 0
			if(bleedTransfusionRiskOverlap == true) {
				yPos = 14
			}
			return "translate("+xPos+","+yPos+")"
		})
		.select("text")
			.text(bleedTransfusionRiskWithout)


	d3.select("#bleedTransfusionCertaintyText")
		.text(bleedTransfusionCertainty)

	d3.select("#bleedTransfusionCertaintyStar1")
		.attr("fill", function(){
			if(bleedTransfusionCertainty == "Very low") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "Low") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedTransfusionCertaintyStar2")
		.attr("fill", function(){
			if(bleedTransfusionCertainty == "Low") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedTransfusionCertaintyStar3")
		.attr("fill", function(){
			if(bleedTransfusionCertainty == "Moderate") {
				return "#FFCD44"
			} else if(bleedTransfusionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})

	d3.select("#bleedTransfusionCertaintyStar4")
		.attr("fill", function(){
			if(bleedTransfusionCertainty == "High") {
				return "#FFCD44"
			} else {
				return "#E6E6E6"
			}
		})




}









