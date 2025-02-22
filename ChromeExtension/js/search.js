const search_btn = document.getElementById("submit-button");
const result_container = document.querySelector('#result-container-transcript')

search_btn.addEventListener('click', function () {
    if (result_container.childElementCount > 0) {
        remove_all_children(result_container)
    }

    search_api()
});

async function search_api() {

    var headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Basic ZWxhc3RpYzpwY2lXY2xwTE5kWHVpY1VoWFY4YmhnazI=");

    const query_txt = document.getElementById("searchbox").value
    // Query string to send to elasticSearch
    const query_payload = {
        size: 5,
        from: 0,
        query: {
            "query_string": {
                "query": query_txt
            }
        }
    }
    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(query_payload)
    };

    // Calling ES _search API to retrieve results from "subtitles" API
    const response = await fetch("https://ac55987c83844faa90726d4e5efe92b9.us-central1.gcp.cloud.es.io/subtitles/_search", requestOptions)
    const record = await response.json()
    if(record.hits.total.value > 0) {
        const result_num = Math.min(record.hits.total.value, 5)
        for (let i = 0; i < result_num; i++)  {
            const result = record.hits.hits[i]._source
            const result_dict = {}
            const response_str = '<strong>'+ result.week + ' </br> </strong>'
                + '<strong> Title :: </strong>' + result.lecture_title + '</br>' +
                '<a href="' + result.url + '">  timestamp </a>:: ' + result.time + '<br/>'
                 + '<strong> Subtitles </strong> : '+result.text
                 + '</br>'
            console.log("Resoponse :: ", response_str)
            result_dict["week"] = "Week " + result.week.slice(-1)
            result_dict["lecture_title"] = result.lecture_title
            result_dict["url"] = result.url
            result_dict["time"] = result.time
            result_dict["subtitles"] = result.text
            result_dict["course_name"] = result.course_name
            set_result_format(result_dict)
        }
    } else {
        const result_div = document.createElement('div')
        result_div.innerHTML = "We could not find a related topic"
        result_container.appendChild(result_div)
    }

}

function set_result_format(result_dict) {

    // Initiate html components
    const result_item = document.createElement('div')
    const result_first_row = document.createElement('div')
    const result_second_row = document.createElement('div')
    const result_url = document.createElement('a')
    const result_week = document.createElement('h4')
    const result_course_name = document.createElement('h4')
    const result_time = document.createElement('h4')
    const result_lecture_title = document.createElement('h4')
    const result_subtitles = document.createElement('p')

    // Set up class/ id for some components
    result_item.classList.add("result__item")
    result_first_row.classList.add("result__first--row")
    result_second_row.classList.add("result__second--row")
    result_course_name.classList.add("result__course--name")
    result_time.classList.add("timestamp")
    result_url.classList.add("lecture__url")

    // Set the content of components
    result_url.href = result_dict["url"]
    result_week.innerHTML = result_dict["week"]
    result_course_name.innerHTML = result_dict["course_name"]
    time_reformat = format_time(result_dict["time"])
    result_time.innerHTML = time_reformat
    result_lecture_title.innerHTML = result_dict["lecture_title"]
    result_subtitles.innerHTML = result_dict["subtitles"]

    // Organize html component structure
    result_item.appendChild(result_url)
    result_item.appendChild(result_first_row)
    result_first_row.append(result_week)
    result_first_row.append(result_course_name)
    result_item.appendChild(result_second_row)
    result_second_row.appendChild(result_time)
    result_second_row.appendChild(result_lecture_title)
    result_item.appendChild(result_subtitles)

    result_container.appendChild(result_item)
}

function format_time(time) {
    let parts = time.split(':').map(part => parseInt(part, 10));
    let seconds = parts[0];
    let minutes = parts[1];
    let hours = parts.length > 2 ? parts[2] : 0;

    // Make sure each part has two digits
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    seconds = seconds.toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function remove_all_children(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const parent = document.querySelector('.result__container--transcript');

    parent.addEventListener('click', function (event) {
        // Check if the clicked element or its parent has the class 'container'
        let container = event.target.classList.contains('result__item') 
            ? event.target 
            : event.target.closest('.result__item');

        if (container) {
            // Extract the URL from the child anchor tag
            let url = container.querySelector('.lecture__url').getAttribute('href');

            // Open the URL
            if (url) {
                chrome.tabs.create({ url: url });
            }
        }
    });
});
