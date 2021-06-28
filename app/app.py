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
    for pid in results['Plan ID']:
        path = os.path.join(data_dir, "plans", f"{pid}.geojson")
        with open(path) as f:
            plans.append(json.load(f))

    return jsonify(plans)
