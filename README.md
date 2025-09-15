# Implementation Plan

## Kubernetes Version

1. **Setup**
   - Create project structure
   - Initialize npm package
   - Install dependencies (Express)

2. **Implementation**
   - Create shared weather service
   - Create Express app with API endpoints
   - Create Dockerfile
   - Create Kubernetes manifests

3. **Local Development**
   - Test Express app locally
   - Build Docker container
   - Test container locally
   - Deploy to minikube

## Azure Functions Version

1. **Setup**
   - Install Azure Functions Core Tools
   - Create a new function app
   - Set up project structure

2. **Implementation**
   - Share the same weather service module
   - Implement HTTP trigger function
   - Configure function bindings

3. **Local Development**
   - Run function app locally
   - Test HTTP endpoints

## Testing Both Versions

1. Create simple test script to compare:
   - Response times
   - Resource usage
   - Scalability
   - Cold start performance

2. Document findings and analysis





Setup with new account:
have a profile with a valid debit card
az login
copy/paste the new subscrption in tf conf
Microsoft.Storage, Microsoft.Web, Microsoft.ContainerRegistry, Microsoft.OperationalInsights, Microsoft.DBforPostgreSQL, microsoft.insights - register as resource provider
tf apply tfstate boostrap
tf apply in functions tf dir
get publish profile for func-api - update github secret
Create Azure Service Principal:
   # First, get your subscription ID
   az account show --query id --output tsv

   # Then create the service principal (replace YOUR_SUBSCRIPTION_ID with the actual value)
   az ad sp create-for-rbac \
   --name "github-actions-devinsights" \
   --role contributor \
   --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
   --sdk-auth  



Seed and migrate:
--------
curl "https://func-nbu-blog-api.azurewebsites.net/api/db/migrate?operation=migrate&key=nbu-secure-migration-key-2025"


{
  "operation": "migrate",
  "success": true,
  "message": "Database migrations completed successfully",
  "duration": 315,
  "timestamp": "2025-08-10T12:54:05.050Z",
  "environment": "production"

--------
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: nbu-secure-migration-key-2025" \
  -d '{"operation": "seed"}' \
  "https://func-nbu-blog-api.azurewebsites.net/api/db/migrate"
{
  "operation": "seed",
  "success": true,
  "message": "Database seeding completed successfully",
  "duration": 159,
  "timestamp": "2025-08-10T13:06:28.758Z",
  "environment": "production"
































Diploma Thesis has to be prepared following specific structure, quality and quantity of
analyses to demonstrate completely the problem solved.
The software developed, libraries and/or algorithms could be a part of an Appendix.
They are explained in the thesis in the way to allow the reader to repeat the
investigation and reach the same results and conclusion.
The level of detail to describe the problem and solutions is expected to be enough to
allow clear evaluation of the contribution of the student.
The style of the thesis is expected to follow well-known standards in research
community.
Clear statement concerning the contribution of the author is expected.
10/18/2023 Graduation in Network Technologies 13
Department of Informatics
The complexity of the diploma thesis for bachelor and master students is different such as:
- For bachelor thesis it is expected to present a possible solution of the problem main
characteristics and analyses made.
- For master thesis it is expected to present alternative approaches of the problem as well
as comparative analyses of the existing and new approaches and results with clear pros and
cons.
The software developed within the scope of the diploma thesis that has commercial or
practical value could be presented. The commercial and practical value does not contribute
to the grade of the student.
When a software is developed it is expected all functions/libraries/files/results developed
by the students to be well documented. When part of the code is generated automatically,
or open-source libraries are used it should be clearly stated.
10/18/2023 Graduation in Network Technologies 14
Department of Informatics
Diploma thesis is expected also to have:
• Clearly described aim and tasks for the proposed investigation
• Correct citations of the references
• Logical structure from the theoretical and practical point of view
• Conclusion with clear statement of the contribution of the author
• Title page with name of the programme of study, name of the author, matriculation
number, name of the tutor, year of writing
• Abstract – approximately half page
• Main part with minimum 45 pages for bachelor students and 65 pages for master
students (1 page has 1800 symbols). It has to be divided into chapters, sections,
subsections and paragraphs. All figures, charts, formulae, parts of the code
incorporated in the text has to be numbered and cited accordingly.
• Figures, tables, charts are not part of the required 45 pages with 1800 symbols each.
• All graphical parts should be numbered.
• The bibliography includes all cited sources.
• There might be additional appendixes, tables with abbreviations, figures etc.
10/18/2023 Graduation in Network Technologies 15
Department of Informatics
The description in the diploma thesis expected to show:
• The problem
• Analyses of the cases when the problem is expected to be considered
• Approaches how to solve the problems
• A possible solution for bachelor thesis and more possible solutions for master
thesis.
• The solutions may not be original. However, it is expected to be developed by the
student.
• The conclusion should state clearly what are the pros and cons of the solution and
what could be done further.
• The original part of the diploma thesis should be at least 50% of all text. It should
be presented in a separate chapter(s).
• All main characteristics of the original solution, functions, main and additional
requirements, limits for implementation, tests, control of the investigation,
comparison to the well-known from the literature solutions have to be described.

• The text of the diploma thesis should follow well-known style.
• The printed copy should be double side, on white paper, format A4.
• Electronic copy on a CD or a memory stick should be also delivered to the
department.
• Text has to be double space, pages should have intent: 30 mm left, 20 mm right, top
and down, 30 rows per page with 58-60 symbols per row.
• The intent between section should be 12-17 mm.
• Titles of the sections, chapters, subsections should be symmetric to the text. The
words in the titles should have first symbol capitalised. Use of hyphens is forbidden
and there should be no dot at the end of the titles.
• Every chapter starts at new right non-even page.
• The font of the titles should allow easy identification.
10/18/2023 Graduation in Network Technologies 19
Department of Informatics
• Pages are numbered with Arabic digits.
• Leading page of the diploma thesis is separated from the main text.
• All big figures, tables, pictures could be placed on separated pages too. They should
be numbered using the number of the chapter and the sequence number of the
figure in this chapter.
• When the number of tables and figures are significant, they could be placed in an
Appendix and cited accordingly. The order should follow the first citation in the text.
• After the leading page diploma thesis proposal is attached as well as declaration
from the student and the tutor concerning the originality of the proposed solution.
• It is recommended to avoid the jargon in the diploma thesis except the cases when
the term is widely accepted.
• The text is in passive voice. The use of first-person plural or singular is accepted only
in the parts where the contribution of the author is presented.
• All the text that could be referenced is expected to be avoided.
10/18/2023 Graduation in Network Technologies 20
Department of Informatics
• Part of the code also could be incorporated into the text to illustrate the proposed
solution.
• The code should be separated in blocks with different font and enough comments.
• The code is in the form of text rather than picture.
• The names of the variable should follow the logic of the code and support the
thesis.
• The comments should reference the text of the thesis.
• The code is separated in an Appendix and only the important parts are used in the
text.
• Implementation software is illustrating the ideas of the thesis.
• During the defence of the diploma thesis the software is presented by means of
functionality, algorithms, tests, use-cases rather than code itself.
• The conclusion includes an overview of the work performed, all important results
with short critical analyses, contribution of the author, possibilities to continue the
investigation.
10/18/2023 Graduation in Network Technologies 21
Department of Informatics
• Mathematical formulae should be in italic. The font should be the same as the
main font of the diploma thesis. All symbols are referenced in italic in the text in
the same way.