from flask import Blueprint, render_template

global_scope = Blueprint("views", __name__)

@global_scope.route("/", methods=['GET'])
def home():
    return render_template("home.html", active_page='/black_box/home')

@global_scope.route("/normalization", methods=['GET'])
def normalization():
    return render_template("normalization.html", active_page='/white_box/normalization')

@global_scope.route("/qrs", methods=['GET'])
def qrs():
    return render_template("qrs.html", active_page='/white_box/qrs')

@global_scope.route("/segmentation", methods=['GET'])
def segmentation():
    return render_template("segmentation.html", active_page='/white_box/segmentation')

@global_scope.route("/prediction", methods=['GET'])
def prediction():
    return render_template("prediction.html", active_page='/white_box/prediction')

@global_scope.route("/graph", methods=['GET'])
def graph():
    return render_template("graph.html", active_page='/white_box/graph')

@global_scope.route("/credits", methods=['GET'])
def credits():
    return render_template("credits.html", active_page='credits')