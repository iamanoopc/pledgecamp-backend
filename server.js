// server/server/js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 8000;

const mockdata = require("./mockdata.js")

const server = app.listen(`${port}`, function() {
    console.log(`Server started on port ${port}`);
  });

app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var count = 0;

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

// let filtersApplied = {
//   featured: true,
//   categoryIds: [],
//   fundingGoal: {
//     min: 0,
//     max: 10000
//   },
//   minimumPercentage: 0
// }

// let filtered = projectListings



// get all project listings
app.get("/projects", (req, res) => {
  res.send([projectListings, notifications]);
});

// get all filtered project listings
// app.get("/filteredProjects", (req, res) => {
//   console.log('de kidakkunu', filteredProjects);
  
//   res.send(filteredProjects);
// });

// get all notification
// app.get("/notifications", (req, res) => {
//   res.send(notifications);
// });


app.post('/filters', function(req, res) {
  console.log(req.body, 'request body');
  let filtersApplied = req.body.filters;

  // Category filter is applied
  let filteredCategoryIds = filtersApplied.categoryIds
  // filter projects based on categories selected
  let applyFilterCategoryIds = projectListings.filter((project) => {
    return filteredCategoryIds.indexOf(project.categoryId) >-1
  })
  console.log('applyFilterCategoryIds', applyFilterCategoryIds.length);


  // filter projects based on funding range selected
  let applyFilterFundingRange = applyFilterCategoryIds.filter((project) => {
    return project.fundingGoal >= filtersApplied.fundingGoal.min && project.fundingGoal <= filtersApplied.fundingGoal.max
  })
  console.log('applyFilterFundingRange', applyFilterFundingRange.length);

  
  // filter projects based on min percentage completion selected
  let applyFilterPercentageComplete = applyFilterFundingRange.filter((project) => {
    return project.percentageComplete > filtersApplied.percentageComplete
  })
  console.log('applyFilterPercentageComplete', applyFilterPercentageComplete.length);
  // filter projects based on featured 
  let applyFilterFeatured 
  if(filtersApplied.featured) {
    applyFilterFeatured = applyFilterPercentageComplete.filter((project) => {
      return project.featured
    })
  }else {
    // console.log('applyFilterPercentageComplete', applyFilterPercentageComplete);
    
    applyFilterFeatured = applyFilterPercentageComplete
  }
  

  filteredProjects = applyFilterFeatured;
  
  
  
  console.log('filteredProjects', filteredProjects.length);

  let notificationProjectIds = filteredProjects.map(project => project.projectId)
  console.log('notificationProjectIds', notificationProjectIds);
  let filteredNotifications = notifications.filter((notification) => {
    return notificationProjectIds.indexOf(notification.projectId) > -1
  })
  
  
  console.log('filteredNotifications', filteredNotifications.length);
  
  res.send([filteredProjects,filteredNotifications]);
  // res.send("filters set -- response from server")
  
});




app.get("/", (req, res) => {
  res.send(`Hi! Server is listening on port ${port}`);
});