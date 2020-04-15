// server/server/js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

const mockdata = require("./mockdata.js")

const server = app.listen(`${port}`, function() {
    console.log(`Server started on port ${port}`);
  });

app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


let projectListings = mockdata.projectListings;
let notifications = mockdata.notifications;

const allProjectCategoryIds = projectListings.map(project => project.categoryId)
const fundingGoals = projectListings.map((project) => project.fundingGoal).sort((a, b) => a - b);

let initialFilterState = {
  featured: false,
  categoryIds: allProjectCategoryIds,
  fundingGoal: {
    min: fundingGoals[0],
    max: fundingGoals[fundingGoals.length - 1]
  },
  minimumPercentage: 0
}

let filteredProjects;

// get all project listings
app.get("/projects", (req, res) => {
  res.send([projectListings, notifications]);
});



app.post('/filters', function(req, res) {
  let filtersApplied = req.body.filters;

  let filteredCategoryIds = filtersApplied.categoryIds
  // filter the projects based on categories selected
  let applyFilterCategoryIds = projectListings.filter((project) => {
    return filteredCategoryIds.indexOf(project.categoryId) >-1
  })
  // filter projects based on funding range selected
  let applyFilterFundingRange = applyFilterCategoryIds.filter((project) => {
    return project.fundingGoal >= filtersApplied.fundingGoal.min && project.fundingGoal <= filtersApplied.fundingGoal.max
  })  
  // filter projects based on min percentage completion selected
  let applyFilterPercentageComplete = applyFilterFundingRange.filter((project) => {
    return project.percentageComplete > filtersApplied.percentageComplete
  })
  // filter projects based on featured -if featured is false then show all
  let applyFilterFeatured 
  if(filtersApplied.featured) {
    applyFilterFeatured = applyFilterPercentageComplete.filter((project) => {
      return project.featured
    })
  }else {
    applyFilterFeatured = applyFilterPercentageComplete
  }
  // Final filtered projects
  filteredProjects = applyFilterFeatured;
   
  let notificationProjectIds = filteredProjects.map(project => project.projectId)
  let filteredNotifications = notifications.filter((notification) => {
    return notificationProjectIds.indexOf(notification.projectId) > -1
  })
   
  res.send([filteredProjects,filteredNotifications]);
});




app.get("/", (req, res) => {
  res.send(`Hi! Server is listening on port ${port}`);
});