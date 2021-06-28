import os

import pandas
from flask import Flask, json, jsonify, render_template

app = Flask(__name__)
data_dir = os.path.abspath("../data")
database_path = os.path.join(data_dir, "metadata.feather")
database = pandas.read_feather(database_path)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/FloorPlanSearch")
def search_floorplans():
    n_results = 10
    results = database.sample(n_results)

    plans = []
    for _, result in results.iterrows():
        plan = {
            'metadata': [
                f"Type: {result['TA Group'].capitalize()}",
                f"Year built: {result['Year']}",
                f"Total area: {result['Total Unit Area']:.2f}m²"
            ]
        }
        path = os.path.join(data_dir, "plans", f"{result['Plan ID']}.geojson")
        with open(path) as f:
            plan['geo'] = json.load(f)
        plans.append(plan)

    return jsonify(plans)
